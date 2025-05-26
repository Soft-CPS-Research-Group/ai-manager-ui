/// <reference types="cypress" />

describe('Experiment Configs Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Experiment Configs').click()
  })

  it('should not create config - error file name', () => {
    cy.contains('New Config').click();

    cy.get('textarea').invoke('val', '{"experiment": "abc", "value": 123}').trigger('input');
    cy.contains('Save Config').should('be.disabled');
  });

  it('should not create config - error json file', () => {
    cy.contains('New Config').click();

    cy.get('input[name="name"]').type('test-config.json');
    cy.get('textarea').type('{"valor": "10"');

    cy.contains('Save Config').click();
    cy.contains('Invalid JSON format. Please fix syntax errors.').should('exist');
  });

  it('should create config - success', () => {
    cy.intercept('POST', '**/experiment-config/create', {
      statusCode: 200,
      body: {
        file_name: 'test-config.json',
        config: {
          experiment: 'abc',
          value: 123
        }
      }
    }).as('createConfig');

    cy.contains('New Config').click();

    cy.get('input[name="name"]').type('test-config.json');
    cy.get('textarea').invoke('val', '{"experiment": "abc", "value": 123}').trigger('input');

    cy.contains('Save Config').click();
    cy.wait('@createConfig');
    cy.contains('Config created successfully!').should('exist');
  });
})
