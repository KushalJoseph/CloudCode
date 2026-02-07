# LLM Schema for React Flow Diagrams (Comprehensive Resource Catalog)

This schema defines the structure for major AWS resource categories. Your backend LLM should use this as a reference "cookbook" to generate correct `terraformParams` for any resource.

## 1. General Node Structure (The Wrapper)

Every resource, regardless of type, must be wrapped in this React Flow node structure.

```typescript
type Node = {
  id: string;
  type: "custom"; // ALWAYS "custom"
  position: { x: number; y: number };
  data: {
    label: string;
    service: string;
    resourceType: string; // The specific Terraform resource type (e.g., aws_s3_bucket)
    icon: string;
    color: string;
    description: string;
    cost?: string;
    terraformParams: any; // See specific schemas below
  };
};
```

---

## 2. Resource-Specific `terraformParams` Schemas

### 💻 Compute Resources

**Color:** `blue`
**Common Icons:** ⚡ (Lambda), 🖥️ (EC2), 🐳 (ECS/Fargate)

#### AWS Lambda (`aws_lambda_function`)

```json
{
  "function_name": "my-function",
  "runtime": "nodejs18.x", // or python3.9, java11, go1.x
  "handler": "index.handler",
  "memory_size": 128, // 128 to 10240 MB
  "timeout": 3, // Seconds (max 900)
  "architectures": ["x86_64"], // or ["arm64"]
  "environment": {
    "variables": { "DB_TABLE": "users" }
  },
  "vpc_config": {
    "subnet_ids": ["${aws_subnet.private.id}"],
    "security_group_ids": ["${aws_security_group.lambda_sg.id}"]
  }
}
```

#### EC2 Instance (`aws_instance`)

```json
{
  "ami": "ami-0c55b159cbfafe1f0",
  "instance_type": "t3.micro",
  "key_name": "my-key-pair",
  "subnet_id": "${aws_subnet.public.id}",
  "vpc_security_group_ids": ["${aws_security_group.web.id}"],
  "associate_public_ip_address": true,
  "root_block_device": {
    "volume_size": 8,
    "volume_type": "gp3"
  },
  "tags": { "Name": "WebServer" }
}
```

#### ECS Service (`aws_ecs_service`)

```json
{
  "name": "my-service",
  "cluster": "${aws_ecs_cluster.main.id}",
  "task_definition": "${aws_ecs_task_definition.app.arn}",
  "desired_count": 2,
  "launch_type": "FARGATE",
  "network_configuration": {
    "subnets": ["${aws_subnet.private.id}"],
    "security_groups": ["${aws_security_group.ecs_sg.id}"],
    "assign_public_ip": false
  }
}
```

---

### 🗄️ Database Resources

**Color:** `purple`
**Common Icons:** 🗄️ (DynamoDB), 🐬 (RDS), 🐘 (Postgres), 💾 (ElastiCache)

#### DynamoDB Table (`aws_dynamodb_table`)

```json
{
  "name": "users-table",
  "billing_mode": "PAY_PER_REQUEST", // or PROVISIONED
  "hash_key": "userId",
  "range_key": "timestamp",
  "attribute": [
    { "name": "userId", "type": "S" },
    { "name": "timestamp", "type": "N" }
  ],
  "stream_enabled": true,
  "stream_view_type": "NEW_AND_OLD_IMAGES"
}
```

#### RDS Instance (`aws_db_instance`)

```json
{
  "identifier": "main-db",
  "engine": "postgres", // mysql, mariadb, oracle-se2, sqlserver-ex
  "engine_version": "14.1",
  "instance_class": "db.t3.micro",
  "allocated_storage": 20,
  "storage_type": "gp3",
  "username": "admin",
  "password": "${var.db_password}", // Note: Don't hardcode secrets!
  "multi_az": false,
  "publicly_accessible": false,
  "skip_final_snapshot": true
}
```

#### ElastiCache Cluster (`aws_elasticache_cluster`)

```json
{
  "cluster_id": "redis-cluster",
  "engine": "redis",
  "node_type": "cache.t3.micro",
  "num_cache_nodes": 1,
  "parameter_group_name": "default.redis7",
  "engine_version": "7.0",
  "port": 6379
}
```

---

### 📦 Storage Resources

**Color:** `orange`
**Common Icons:** 🪣 (S3), 💿 (EBS), 📂 (EFS)

#### S3 Bucket (`aws_s3_bucket`)

```json
{
  "bucket": "my-app-assets",
  "force_destroy": true,
  "tags": { "Environment": "Prod" }
}
```

#### EFS File System (`aws_efs_file_system`)

```json
{
  "creation_token": "my-efs",
  "performance_mode": "generalPurpose",
  "throughput_mode": "bursting",
  "encrypted": true
}
```

---

### 🌐 Networking Resources

**Color:** `cyan`
**Common Icons:** ☁️ (VPC), 🚪 (Gateway), ⚖️ (Load Balancer), 🛣️ (Route Table)

#### API Gateway v2 (`aws_apigatewayv2_api`)

```json
{
  "name": "http-api",
  "protocol_type": "HTTP", // or WEBSOCKET
  "cors_configuration": {
    "allow_origins": ["*"],
    "allow_methods": ["GET", "POST"],
    "allow_headers": ["content-type"]
  }
}
```

#### Application Load Balancer (`aws_lb`)

```json
{
  "name": "app-lb",
  "internal": false,
  "load_balancer_type": "application",
  "security_groups": ["${aws_security_group.lb_sg.id}"],
  "subnets": ["${aws_subnet.public1.id}", "${aws_subnet.public2.id}"]
}
```

#### VPC (`aws_vpc`)

```json
{
  "cidr_block": "10.0.0.0/16",
  "enable_dns_hostnames": true,
  "enable_dns_support": true,
  "tags": { "Name": "main-vpc" }
}
```

---

### 🔌 Integration & Messaging

**Color:** `green`
**Common Icons:** 📮 (SQS), 📢 (SNS), 🚌 (EventBridge)

#### SQS Queue (`aws_sqs_queue`)

```json
{
  "name": "processing-queue",
  "delay_seconds": 0,
  "max_message_size": 262144,
  "message_retention_seconds": 86400,
  "receive_wait_time_seconds": 10,
  "visibility_timeout_seconds": 30,
  "fifo_queue": false
}
```

#### SNS Topic (`aws_sns_topic`)

```json
{
  "name": "user-updates",
  "display_name": "User Updates Topic"
}
```

---

### 🛡️ Security & IAM

**Color:** `red` or `gray`
**Common Icons:** 🔐 (IAM Role), 🛡️ (Security Group), 🔑 (KMS)

#### IAM Role (`aws_iam_role`)

```json
{
  "name": "lambda-role",
  "assume_role_policy": "jsonencode({...})" // Provide the JSON policy string
}
```

#### Security Group (`aws_security_group`)

```json
{
  "name": "allow_tls",
  "description": "Allow TLS inbound traffic",
  "vpc_id": "${aws_vpc.main.id}",
  "ingress": [
    {
      "description": "TLS from VPC",
      "from_port": 443,
      "to_port": 443,
      "protocol": "tcp",
      "cidr_blocks": ["10.0.0.0/16"]
    }
  ],
  "egress": [
    {
      "from_port": 0,
      "to_port": 0,
      "protocol": "-1",
      "cidr_blocks": ["0.0.0.0/0"]
    }
  ]
}
```
