```mermaid
graph
    A[Request API]
    B[Marshall resource metadata]
    C[Create ResourceEntity]
    D[Failure]
    E[Decrypt metadata]
    C1{ }
    C2{ }
    A --> |is v4 resource type?| C1
    C1 --> |no, is v6 resource type?| C2
    C1 --> |yes| B
    B --> C
    C2 --> |no| D
    C2 --> |yes| E
    E --> C
```
