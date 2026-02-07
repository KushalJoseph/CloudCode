import type { Node, Edge } from 'reactflow';

// Connection rules: source -> target
const VALID_CONNECTIONS: Record<string, string[]> = {
    // Database can connect to itself (e.g. read replica) or compute
    "aws_db_instance": ["aws_lambda_function", "aws_ecs_service", "aws_instance"],
    "aws_dynamodb_table": ["aws_lambda_function", "aws_ecs_service", "aws_instance"],
    "aws_elasticache_cluster": ["aws_lambda_function", "aws_ecs_service", "aws_instance"],

    // Storage
    "aws_s3_bucket": ["aws_lambda_function", "aws_ecs_service", "aws_instance"],
    "aws_efs_file_system": ["aws_lambda_function", "aws_ecs_service", "aws_instance"],

    // Compute can connect to almost everything
    "aws_lambda_function": [
        "aws_dynamodb_table", "aws_db_instance", "aws_elasticache_cluster",
        "aws_s3_bucket", "aws_sqs_queue", "aws_sns_topic", "aws_lambda_function"
    ],
    "aws_instance": [
        "aws_dynamodb_table", "aws_db_instance", "aws_elasticache_cluster",
        "aws_s3_bucket", "aws_sqs_queue", "aws_sns_topic"
    ],
    "aws_ecs_service": [
        "aws_dynamodb_table", "aws_db_instance", "aws_elasticache_cluster",
        "aws_s3_bucket", "aws_sqs_queue", "aws_sns_topic"
    ],

    // Integration
    "aws_sqs_queue": ["aws_lambda_function", "aws_ecs_service", "aws_instance"],
    "aws_sns_topic": ["aws_lambda_function", "aws_sqs_queue"],

    // Networking
    "aws_apigatewayv2_api": ["aws_lambda_function", "aws_lb"],
    "aws_lb": ["aws_instance", "aws_ecs_service", "aws_lambda_function"],

    // Security
    "aws_iam_role": ["aws_lambda_function", "aws_instance", "aws_ecs_service"],
    "aws_security_group": ["aws_instance", "aws_ecs_service", "aws_lb", "aws_db_instance", "aws_elasticache_cluster"]

    // Generic fallbacks if resourceType is missing or we use category
    // "Compute": ["Database", "Storage", "Integration"],
    // "Database": ["Compute"],
    // "Storage": ["Compute"],
    // "Integration": ["Compute"],
    // "Networking": ["Compute"],
};

const INVALID_CONNECTIONS: Record<string, string> = {
    "aws_s3_bucket -> aws_s3_bucket": "S3 buckets don't connect directly to each other",
    "aws_dynamodb_table -> aws_db_instance": "Databases don't connect directly to each other",
    "aws_db_instance -> aws_dynamodb_table": "Databases don't connect directly to each other",
};

export function isValidConnection(
    sourceNode: Node,
    targetNode: Node
): { valid: boolean; reason?: string } {
    const sourceType = sourceNode.data?.resourceType;
    const targetType = targetNode.data?.resourceType;

    if (!sourceType || !targetType) {
        // Fallback or allow if types unknown
        return { valid: true };
    }

    // Check specific invalid patterns first
    const key = `${sourceType} -> ${targetType}`;
    if (INVALID_CONNECTIONS[key]) {
        return { valid: false, reason: INVALID_CONNECTIONS[key] };
    }

    // Check allow list
    const allowedTargets = VALID_CONNECTIONS[sourceType];
    if (allowedTargets) {
        if (allowedTargets.includes(targetType)) {
            return { valid: true };
        }
        // If not in allowed list, check if maybe permissible (simplification: strict mode for now?)
        // Let's implement strict mode logic: if source is in VALID_CONNECTIONS, target MUST be in list.
        return {
            valid: true, // Changing to permissive for categories not fully enumerated, or warn? 
            // Actually, let's be permissive but warn if "unusual"
            reason: "⚠️ Unusual connection"
        };
    }

    return { valid: true };
}

export function detectDanglingNodes(nodes: Node[], edges: Edge[]): Node[] {
    const connectedNodeIds = new Set<string>();

    edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
    });

    return nodes.filter(node => !connectedNodeIds.has(node.id));
}
