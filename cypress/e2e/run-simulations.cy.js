/// <reference types="cypress" />

describe('Run Simulations Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Run Simulations').click()
  })

  it('should run simulation with selected values', () => {
    cy.intercept('POST', '**/run-simulation', {
      statusCode: 200,
      body: {
        config_path: 'experiment.yaml',
        target_host: 'local'
      }
    }).as('runSimulation');

    // Select values from dropdowns
    cy.get('select').eq(0).select('experiment.yaml'); // File Name
    cy.get('select').eq(1).select('local');           // Target Container

    cy.get('button').contains('Run Simulation').click();
    cy.wait('@runSimulation');
    cy.contains('Simulation started successfully!').should('exist');
  });
})
