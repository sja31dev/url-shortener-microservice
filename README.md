# url-shortener-microservice

## Part 3 of Free Code Camp Backend Challenges

1. User Story: I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.

2. User Story: If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.

3. User Story: When I visit that shortened URL, it will redirect me to my original link.

### Example use

* `https://<host>/new/http://www.website.com`

### Example response
      
`{ "original_url":"http://www.website.com", "short_url":"https://<host>/123" }`

Going to the `short_url` will redirect to the `original_url`