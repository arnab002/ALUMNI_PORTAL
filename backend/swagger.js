import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MERN-COLLEGE-ERP API DOCUMENTATION',
      version: '1.0.0',
      description: 'Your API Description',
    },
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app, port) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
};

export default swaggerDocs;