import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KHBER DEVS Enterprise System API Documentation",
      version: "1.0.0",
      description: "Interactive Swagger API reference document for KHBER DEVS CMS and CRM lead pipelines.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Production API Server Node Gateway",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Read JS doc comments from route definitions
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

// Serve interactive UI
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerSpec));

export default router;
