// @flow
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Form, Button, Input, Icon } from 'antd';
import { isCurrency } from 'validator';

import './app.scss';


type Field = {
  value: number,
  validateStatus: 'success' | 'error',
  errorMsg: string | null,
  pristine: boolean
};

type State = {
  saving: boolean,
  [x: string]: Field
};

const FormItem = Form.Item;

class App extends Component<{}, State> {
  // faux timeout when revenue is done saving
  FAUX_TIMEOUT: number = 1000;

  // loaded async but should be ready by the time
  // the user submits the form
  revenueObj: Object;

  state = {
    saving: false,
    paperOrders: {
      value: 0.00,
      validateStatus: 'success',
      errorMsg: null,
      pristine: true
    },
    deliveries: {
      value: 0.00,
      validateStatus: 'success',
      errorMsg: null,
      pristine: true
    },
    expenses: {
      value: 0.00,
      validateStatus: 'success',
      errorMsg: null,
      pristine: true
    }
  }

  componentDidMount() {
    ipcRenderer.send( '/windows/update-revenue/load-data' );
    ipcRenderer.on( '/windows/update-revenue/loaded-data', ( evt: Object, res: Object ) => {
      this.revenueObj = res;
    });

    // once done updating send the command to close this window
    // which will also let the main window know we're done
    ipcRenderer.on( '/windows/update-revenue/updated', () => {
      // add a faux delay to show loading indicator
      // for at least a second. saving goes by too fast...
      setTimeout( () => {
        ipcRenderer.send( '/windows/update-revenue/close' );
      }, this.FAUX_TIMEOUT );
    });
  }

  handleInputChange = ( evt: Object ) => {
    const { value, id } = evt.target;
    const output = {};
    let invalid = false;

    if( !isCurrency( value ) ) {
      invalid = true;
    }

    output[ id ] = {
      value: parseFloat( value ),
      validateStatus: invalid ? 'error' : 'success',
      errorMsg: invalid ? 'Must be a number!' : null,
      pristine: false
    };

    this.setState( output );
  }

  handleSubmit = ( evt: Object ) => {
    evt.preventDefault();
    this.revenueObj.paper_orders = this.state.paperOrders.value;
    this.revenueObj.deliveries = this.state.deliveries.value;
    this.revenueObj.expenses = this.state.expenses.value;

    ipcRenderer.send( '/windows/update-revenue/update', this.revenueObj );
    this.setState({ saving: true });
  }

  handleCancel = () => {
    ipcRenderer.send( '/windows/update-revenue/close', true );
  }

  validateForm = (): boolean => {
    let invalid = false;

    // loop through the fields and validate them
    // if the field is pristine consider it invalid as well
    [ 'paperOrders', 'deliveries', 'expenses' ].forEach( ( fieldstr: string ) => {
      const field = this.state[ fieldstr ];
      invalid = field.validateStatus === 'error' || field.pristine;
    });

    return invalid;
  }

  render() {
    const { paperOrders, deliveries, expenses } = this.state;

    return (
      <div id="update-revenue">
        {this.state.saving && (
          <div className="loading">
            <Icon type={'loading'} />
          </div>
        )}
        <Form onSubmit={this.handleSubmit}>
          <section>
            <h2>{'income'}</h2>
            <FormItem
              label={'Paper Orders'}
              validateStatus={paperOrders.validateStatus}
              help={paperOrders.errorMsg || ''}
            >
              <Input
                autoFocus
                id="paperOrders"
                placeholder={'0.00'}
                addonBefore={'$'}
                onChange={this.handleInputChange}
              />
            </FormItem>
            <FormItem
              label={'Deliveries'}
              validateStatus={deliveries.validateStatus}
              help={deliveries.errorMsg || ''}
            >
              <Input
                id="deliveries"
                placeholder={'0.00'}
                addonBefore={'$'}
                onChange={this.handleInputChange}
              />
            </FormItem>
          </section>

          <section>
            <h2>{'expenses'}</h2>
            <FormItem
              label={'Expenses'}
              validateStatus={expenses.validateStatus}
              help={expenses.errorMsg || ''}
            >
              <Input
                id="expenses"
                placeholder={'0.00'}
                addonBefore={'$'}
                onChange={this.handleInputChange}
              />
            </FormItem>
          </section>

          <section className="buttons">
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.state.saving || this.validateForm()}
            >
              {'Save'}
            </Button>
            <Button
              type="default"
              onClick={this.handleCancel}
            >
              {'Cancel'}
            </Button>
          </section>
        </Form>
      </div>
    );
  }
}

export default App;
