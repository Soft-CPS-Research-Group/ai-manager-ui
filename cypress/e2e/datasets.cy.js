/// <reference types="cypress" />

import 'cypress-file-upload';

describe('Datasets Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Datasets').click()
  })

  it('cancel button should work', () => {
    cy.contains('New Dataset').click();
    cy.contains('Cancel').click();
    cy.contains('New Dataset').should('be.visible');
  })

  it('should create dataset', () => {
    cy.intercept('POST', '**/dataset', {
      statusCode: 200,
      body: {
        "name": "cypress-test",
        "site_id": "PulseCharge",
        "citylearn_configs": {
          "random_seed": 2022,
          "root_directory": "cypress-test",
          "central_agent": false,
          "simulation_start_time_step": 0,
          "simulation_end_time_step": 8759,
          "episode_time_steps": 1,
          "rolling_episode_split": false,
          "random_episode_split": false,
          "seconds_per_time_step": 3600,
          "observations": {
            "month": {
              "active": false,
              "shared_in_central_agent": false
            },
            "day_type": {
              "active": false,
              "shared_in_central_agent": false
            },
            "hour": {
              "active": false,
              "shared_in_central_agent": false
            },
            "daylight_savings_status": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_dry_bulb_temperature": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_dry_bulb_temperature_predicted_1": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_dry_bulb_temperature_predicted_2": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_dry_bulb_temperature_predicted_3": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_relative_humidity": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_relative_humidity_predicted_1": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_relative_humidity_predicted_2": {
              "active": false,
              "shared_in_central_agent": false
            },
            "outdoor_relative_humidity_predicted_3": {
              "active": false,
              "shared_in_central_agent": false
            },
            "direct_solar_irradiance": {
              "active": false,
              "shared_in_central_agent": false
            },
            "direct_solar_irradiance_predicted_1": {
              "active": false,
              "shared_in_central_agent": false
            },
            "direct_solar_irradiance_predicted_2": {
              "active": false,
              "shared_in_central_agent": false
            },
            "direct_solar_irradiance_predicted_3": {
              "active": false,
              "shared_in_central_agent": false
            },
            "carbon_intensity": {
              "active": false,
              "shared_in_central_agent": false
            },
            "indoor_dry_bulb_temperature": {
              "active": false,
              "shared_in_central_agent": false
            },
            "net_electricity_consumption": {
              "active": false,
              "shared_in_central_agent": false
            },
            "electricity_pricing": {
              "active": false,
              "shared_in_central_agent": false
            },
            "electric_vehicle_soc": {
              "active": false,
              "shared_in_central_agent": false
            }
          },
          "actions": {
            "cooling_storage": {
              "active": false
            },
            "heating_storage": {
              "active": false
            },
            "dhw_storage": {
              "active": false
            },
            "electrical_storage": {
              "active": false
            },
            "electric_vehicle_storage": {
              "active": false
            }
          },
          "agent": {
            "type": "citylearn.agents.rbc.BasicBatteryRBC",
            "attributes": {
              "capacity": 40,
              "nominal_power": 50,
              "initial_soc": 0.25,
              "depth_of_discharge": 0.1
            }
          },
          "reward_function": {
            "type": "",
            "attributes": {}
          }
        },
        "from_ts": "2025-06-20 15:24:00",
        "until_ts": "2025-06-26 15:24:00"
      }
    }).as('newDataset');

    cy.contains('New Dataset').click();

    cy.get('input[name="name"]').type('cypress-test');
    cy.get('input[name="root_directory"]').type('cypress-test');

    cy.get('input[type="file"]').attachFile('agent-config.json');

    cy.get('input[name="from"]').invoke('val', '2025-06-07T14:30').trigger('input');
    cy.get('input[name="until"]').invoke('val', '2025-06-09T18:45').trigger('input');

    cy.get('button').contains('Save Dataset').click();
    cy.wait('@newDataset');
    cy.contains('Dataset created successfully!').should('exist');
  })
})
