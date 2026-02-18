# LINE Login API Status Codes

Reference: [LINE Login v2.1 API reference](https://developers.line.biz/en/reference/line-login/#status-codes)

## Common Specifications

### Status Codes

These HTTP status codes are returned after an API call. The LINE Login API follows the HTTP status code specification unless otherwise stated.

| Status Code | Name | Description |
| :--- | :--- | :--- |
| **200** | OK | The request succeeded. |
| **400** | Bad Request | There was a problem with the request. Check the request parameters and JSON format. |
| **401** | Unauthorized | Check that the authorization header is correct. |
| **403** | Forbidden | You are not authorized to use the API. Confirm that your account or plan is authorized to use the API. |
| **413** | Payload Too Large | Request exceeds the max size of 2MB. Make the request smaller than 2MB and try again. |
| **429** | Too Many Requests | Temporarily restricting requests because rate-limit has been exceeded by a large number of requests. |
| **500** | Internal Server Error | There was a temporary error on the API server. |

---

## Specific Error Responses

### Verify ID Token Errors
**Endpoint:** `POST https://api.line.me/oauth2/v2.1/verify`

If the ID token verification fails, a **400 Bad Request** is returned with a JSON object containing an `error_description`.

| Error Description | Description |
| :--- | :--- |
| `Invalid IdToken.` | The ID token is malformed or the signature is invalid. |
| `Invalid IdToken Issuer.` | The ID token was generated on a site other than `https://access.line.me`. |
| `IdToken expired.` | The ID token has expired. |
| `Invalid IdToken Audience.` | The ID token's Audience value is different from the `client_id` specified in the request. |
| `Invalid IdToken Nonce.` | The ID token's Nonce value is different from the `nonce` specified in the request. |
| `Invalid IdToken Subject Identifier.` | The ID token's SubjectIdentifier value is different from the `user_id` specified in the request. |

### Deauthorize App Errors
**Endpoint:** `POST https://api.line.me/user/v1/deauthorize`

Returns **400 Bad Request** if the access token for the target user is invalid. Possible reasons:
* The user has already deauthorized your app.
* You have already deauthorized your app on behalf of the user via the API.

---

## Additional Notes

* **Rate Limits:** Rate limit thresholds for the LINE Login API are not disclosed. If you send a large number of requests within a short period, requests may be temporarily restricted.
* **Response Headers:** Responses include `x-line-request-id`. This ID is issued for each request and is useful for debugging or contacting support.