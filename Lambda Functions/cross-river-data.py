import json
import boto3

def lambda_handler(event, context):
    year = event['params']['querystring']['year']
    print("Running for {}".format(year))
    
    s3 = boto3.client('s3')
    response = s3.select_object_content(
            Bucket='cross-river',
            Key='loan.csv',
            ExpressionType='SQL',
            Expression="SELECT SUM(CAST(s.\"loan_amnt\" AS FLOAT)) AS loan_amt_sum, SUM(CAST(s.\"funded_amnt\" AS FLOAT)) AS funded_amt_sum, SUM(CAST(s.\"funded_amnt_inv\" AS FLOAT)) AS funded_amt_inv_sum FROM s3object s WHERE s.\"issue_d\" LIKE '%" + year + "%'\
            AND (s.\"loan_amnt\" <> '' AND s.\"loan_amnt\" IS NOT NULL)\
            AND (s.\"funded_amnt\" <> '' AND s.\"funded_amnt\" IS NOT NULL)\
            AND (s.\"funded_amnt_inv\" <> '' AND s.\"funded_amnt_inv\" IS NOT NULL)",
            InputSerialization = {'CSV': {"FileHeaderInfo": "Use"}},
            OutputSerialization = {'JSON': {"RecordDelimiter": '\n'}},
    )
    
    for event in response['Payload']:
        if 'Records' in event:
            records = event['Records']['Payload'].decode('utf-8')
            # print(records)
    records = json.loads(records)
    res = {}
    for i in records:
        if records[i] is not None:
            res[i] = int(round(records[i]))
    return res