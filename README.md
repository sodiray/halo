# Halo
A master chief app that manages application settings as json (just a glorified kev value store run from lambda - backed by s3).
The commander of your distributed system. Inspired by the KV segment of consul.io.

## Steps to get started
1. Create a new function in lambda
2. If neccisarry build the halo module with `make build`
3. Change the function code entry type to `Upload a .zip file`
4. Upload the `dist/halo.zip`
5. Set the `HALO_BUCKET_NAME` env var on the lambda. This is the bucket is s3 that halo will use to access the configuration file. Ex. `my-halo-bukcet`
6. Set the `HALO_FILE_NAME` env var on the lambda. This is the file that halo will use to store the configuration. Make sure its a `.json` file. Ex. `configs.json`
7. If the bucket and file you specified don't already exist go create them. Upload an empty json file as the file.
8. If you plan to access the halo via http go back to the lambda function and setup an API Gateway.
