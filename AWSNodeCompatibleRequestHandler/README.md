# What is this

This is the `requestHandler` that you would pass to AWS configuration when you try to upload using AWS v3 SDK.

# Why do we have this?

As of the moment of this writing Deno haven't had a compatible layer for Node https, which results in the inner implementation of AWS SDK (which also uses HTTP) became unusable on Deno. So we would need to write a compatible one for Deno if we wish to use AWS SDK S3 V3 sdk.

# How to use this?

Assume your files look like this 

```ts
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";

async function uploadArtifacts({
  bucketName,
  accessKey,
  secretKey,
}: {
  clientId: string;
  accessKey: string;
  secretKey: string;
}) {
  const client = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const bytes = Deno.readFileSync(
    "./test.json"
  );

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: "test.json",
    Body: bytes,
  });

  return client.send(command);
}

await uploadArtifacts({
  accessKey: "<INSERT-YOUR-KEY>",
  secretKey: "<INSERT-YOUR-SECRET-KEY>",
  bucketName: "exampleBucker",
});

```

When you it on Deno, you would get this error
```
error: Top-level await promise never resolved
await uploadArtifacts....
```

We would need to import `AWSNodeCompatibleRequestHandler` from this file and use it like this

```ts
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { AWSNodeCompatibleRequestHandler } from "https://raw.githubusercontent.com/journeyhorizon/common-code-parts/main/AWSNodeCompatibleRequestHandler/mod.ts";

async function uploadArtifacts({
  bucketName,
  accessKey,
  secretKey,
}: {
  clientId: string;
  accessKey: string;
  secretKey: string;
}) {
  const denoRequestHandler = new AWSNodeCompatibleRequestHandler();

  const client = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    requestHandler: denoRequestHandler, //Replace existing request handler here.
  });

  const bytes = Deno.readFileSync(
    "./test.json"
  );

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: "test.json",
    Body: bytes,
  });

  return client.send(command);
}

await uploadArtifacts({
  accessKey: "<INSERT-YOUR-KEY>",
  secretKey: "<INSERT-YOUR-SECRET-KEY>",
  bucketName: "exampleBucker",
});

```