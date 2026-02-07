# CloudCode Sample Prompts

Test prompts organized by complexity level for each cloud provider.

---

## 🟢 Easy (Single Service)

### AWS
- "Create an S3 bucket for storing images"
- "Set up a Lambda function for processing webhooks"
- "Create a DynamoDB table for user sessions"

### GCP
- "Create a Cloud Storage bucket for file uploads"
- "Set up a Cloud Function to process HTTP requests"
- "Create a Firestore database for storing user data"

### Azure
- "Create a Storage Account for blob storage"
- "Set up a Function App to handle webhooks"
- "Create a Cosmos DB for document storage"

---

## 🟡 Medium (2-3 Services Connected)

### AWS
- "Build a serverless API with API Gateway and Lambda that reads from DynamoDB"
- "Create an S3 bucket with CloudFront CDN for static website hosting"
- "Set up an SQS queue triggered by SNS notifications"

### GCP
- "Build a REST API with Cloud Functions and Firestore"
- "Create a Pub/Sub topic that triggers a Cloud Function to write to BigQuery"
- "Set up Cloud Run with Cloud SQL for a containerized web app"

### Azure
- "Build an API with Function App and Cosmos DB"
- "Create an Event Grid topic that triggers a Function App"
- "Set up App Service with SQL Database for a web application"

---

## 🟠 Complex (Full Architecture, 4-6 Services)

### AWS
- "Create a microservices architecture with API Gateway, multiple Lambda functions, DynamoDB, and SQS for async processing"
- "Build a data pipeline with Kinesis Stream feeding Lambda which stores in S3 and DynamoDB"
- "Set up a secure web app with CloudFront, S3, Lambda, DynamoDB, and Cognito for auth"

### GCP
- "Build a data processing pipeline with Pub/Sub, Cloud Functions, BigQuery, and Cloud Scheduler"
- "Create a microservices architecture with Cloud Run, Load Balancer, Firestore, and Memorystore for caching"
- "Set up an event-driven system with API Gateway, Cloud Functions, Pub/Sub, and Cloud SQL"

### Azure
- "Create a microservices architecture with API Management, multiple Function Apps, Cosmos DB, and Service Bus"
- "Build a streaming pipeline with Event Hubs, Function Apps, and Storage Account"
- "Set up a web application with Application Gateway, App Service, SQL Database, and Redis Cache"

---

## 🔴 Enterprise (Full Stack, 6+ Services with Security)

### AWS
- "Design a secure three-tier web application with VPC, public/private subnets, ALB, EC2 Auto Scaling, RDS, ElastiCache, S3, CloudFront, WAF, and Secrets Manager"
- "Build a serverless event-driven architecture with API Gateway, Lambda, DynamoDB, SQS, SNS, Step Functions, S3, CloudWatch, and KMS encryption"

### GCP
- "Create a secure enterprise application with VPC Network, Subnets, Load Balancer, GKE Cluster, Cloud SQL, Memorystore, Cloud Armor, Secret Manager, and Service Accounts"
- "Build a real-time analytics platform with Pub/Sub, Cloud Functions, BigQuery, Firestore, Cloud Scheduler, and Identity-Aware Proxy"

### Azure
- "Design a secure enterprise architecture with Virtual Network, Subnets, Application Gateway, AKS Cluster, SQL Database, Redis Cache, Key Vault, WAF Policy, and Managed Identity"
- "Build an event-driven microservices platform with API Management, Function Apps, Service Bus, Event Grid, Cosmos DB, Storage Account, and Logic Apps"

---

## 💡 Pro Tips

1. **Be specific** - Include details like "for high availability" or "with auto-scaling"
2. **Mention connections** - Describe how services should interact
3. **Include requirements** - Mention security, caching, or async processing needs
4. **Use real scenarios** - "E-commerce checkout system" vs generic "web app"
