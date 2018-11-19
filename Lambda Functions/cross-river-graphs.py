import boto3
import time
import json

def lambda_handler(event, context):
    year = event['params']['querystring']['year']
    print("Running cross_river_graphs for {}".format(year))

    s3 = boto3.client('s3')
    response = s3.select_object_content(
        Bucket='cross-river',
        Key='loan.csv',
        ExpressionType='SQL',
        Expression="SELECT s.\"loan_amnt\", s.\"funded_amnt\", s.\"funded_amnt_inv\", s.\"grade\", s.\"issue_d\" FROM S3Object s WHERE s.\"issue_d\" LIKE '%" + year + "%'",
        InputSerialization={
            'CSV': {
                    "FileHeaderInfo": "USE",
                    "RecordDelimiter": "\n",
                    "FieldDelimiter": ","
                    }
        },
        OutputSerialization={
            'JSON': {
                    "RecordDelimiter": "\n",
            }
        }
    )
    
    records = ""
    for event in response['Payload']:
        if 'Records' in event:
            records += event['Records']['Payload'].decode('utf-8')

    records = records.split("\n")
    monthly_loan_volume = {}
    loans_by_credit_grade = {}
    
    for row in records[:-1]:
        row = json.loads(row)
        month = row['issue_d'].split('-')[0]
        grade = row['grade']

        if month in monthly_loan_volume:
            monthly_loan_volume[month] += 1
        else:
            monthly_loan_volume[month] = 1
        
        if grade in loans_by_credit_grade:
            if month in loans_by_credit_grade[grade]:
                loans_by_credit_grade[grade][month].append(float(row['loan_amnt']))
            else:
                loans_by_credit_grade[grade][month] = [float(row['loan_amnt'])]
        else:
            loans_by_credit_grade[grade] = {month : [float(row['loan_amnt'])]}

    for grade in loans_by_credit_grade:
        for month in loans_by_credit_grade[grade]:
            loans_by_credit_grade[grade][month] = sum(loans_by_credit_grade[grade][month])/len(loans_by_credit_grade[grade][month])

    return {"monthly_loan_volume": monthly_loan_volume, "loans_by_credit_grade": loans_by_credit_grade}