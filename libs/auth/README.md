
To generate JWT key run the below in you terminal

node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

Copy the key and verify in jwt.io site

https://www.jwt.io/