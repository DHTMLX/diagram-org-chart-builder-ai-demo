export const schemaList = [
    {
        type: "function",
        function: {
            name: "create_org_chart_diagram",
            description: "Creates an organizational chart diagram from an array of nodes.",
            parameters: {
                type: "object",
                properties: {
                    nodes: {
                        type: "array",
                        description: "An array of objects, where each object represents an employee.",
                        items: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                    description: "Unique numerical employee identifier using dot notation for hierarchy (e.g., '1', '1.1', '1.2')."
                                },
                                text: {
                                    type: "string",
                                    description: "Employee's position (e.g., 'CEO', 'Manager', 'Developer')."
                                },
                                parent: {
                                    type: "string",
                                    description: "ID of the direct manager."
                                },
                                title: {
                                    type: "string",
                                    description: "Employee name to display."
                                },
                                partner: {
                                    type: "boolean",
                                    description: "Indicates if the employee is a partner."
                                },
                                assistant: {
                                    type: "boolean",
                                    description: "Indicates if the employee is an assistant."
                                }
                            },
                            required: ["id", "text"]
                        }
                    }
                },
                required: ["nodes"]
            }
        }
    }
];
