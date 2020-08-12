function CreateSwaggerServicePath(op: string, summary: string, description: string) {

      return {
            post: {
                  tags: ["service"],
                  summary: summary,
                  operationId: op.toLowerCase() + "Service",
                  description: description,
                  parameters: [{
                        $ref: "#/components/parameters/subscriptionIdParam"
                  },
                  {
                        $ref: "#/components/parameters/callbackUrlParam"
                  },
                  {
                        $ref: "#/components/parameters/callbackLogsParam"
                  }],
                  requestBody: {
                        description: op + " parameters",
                        content: {
                              "application/json": {
                                    schema: {
                                          $ref: "#/components/schemas/" + op
                                    }
                              }
                        },
                        required: true
                  },
                  callbacks: {
                        statusEvent: {
                              $ref: "#/components/callbacks/statusEvent"
                        },
                        logEvent: {
                              $ref: "#/components/callbacks/logEvent"
                        }
                  },
                  responses: {
                        202: {
                              $ref: "#/components/responses/Accepted"
                        }
                  }
            }
      };
}
export { CreateSwaggerServicePath };
