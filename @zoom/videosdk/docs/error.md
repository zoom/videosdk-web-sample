# Error Codes

## example
{type: "JOIN_MEETING_FAILED", reason: "Meeting Password wrong.", errorCode: 3004}


| errorCode | reason |
|------------------|------------|
|       0     |      common success    |
|       200|   common error|
|       3004    |       Meeting Password wrong. |


## common error
| reason|
|------------|
|       This account does not exist or does not belong to you    |
|       Parse lite sdk topic and pwd fail    | 
|       Parse topic and pwd fail    | 
|       The token is expired or more than 2 days or ineffective|
|       Verify JWT failed    |
