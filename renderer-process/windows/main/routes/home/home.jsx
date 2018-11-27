// @flow
import React, { Component, Fragment } from 'react';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import { Card, Icon, Skeleton, Menu, Dropdown } from 'antd';
import { Line } from 'react-chartjs-2';

import './home.scss';


type State = {
  activedate: Date,
  loading: boolean,
  revenues: Array<any>
};


// overlay component for the actions dropdown component
// calls `onAction` with the type (edit, send, etc) and the
// item for which the action was triggered for
const Overlay = ({ item, onAction }: Object ) => (
  <Menu onClick={( e: Object ) => onAction( e.key, item )}>
    <Menu.Item key="edit">
      {'Edit'}
    </Menu.Item>
    <Menu.Item key="send">
      {'Send'}
    </Menu.Item>
  </Menu>
);


class Home extends Component<{}, State> {
  // faux timeout when loading data
  FAUX_TIMEOUT: number = 1000;

  state = {
    activedate: new Date(),
    loading: true,
    revenues: []
  }

  componentDidMount() {
    ipcRenderer.send( '/windows/main/load-data', this.state.activedate );
    ipcRenderer.on( '/windows/main/loaded-data', this.handleLoadedData );
    ipcRenderer.on( '/windows/update-revenue/closed', this.handleUpdate );
    ipcRenderer.on( '/windows/main/checked-week', this.handleCheckedWeek );
    ipcRenderer.on( '/windows/main/dialogs/creating-week', this.handleCreatingWeek );
    ipcRenderer.on( '/windows/main/dialogs/created-week', this.handleLoadedData );
  }

  toCommas = ( num: number ): string => {
    const x = num.toString();
    return x.replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
  }

  handleLoadedData = ( evt: Event, res: Array<Object> ) => {
    setTimeout( () => {
      this.setState({ revenues: res, loading: false });
    }, this.FAUX_TIMEOUT );
  }

  handleUpdate = ( evt: Object, res: Object ) => {
    const { revenues } = this.state;
    const idx = revenues.findIndex( ( item: Object ) => (
      item._id === res._id
    ) );

    if( idx > -1 ) {
      revenues[ idx ] = res;
    }

    this.setState({ revenues });
  }

  handleCheckedWeek = ( evt: Object, yes: boolean, date: Date ) => {
    // open dialog if requested week is not found
    if( !yes ) {
      ipcRenderer.send( '/windows/main/dialogs/create-week', date );
      return;
    }

    // otherwise proceed with loading the data
    ipcRenderer.send( '/windows/main/load-data', date );
    this.setState({ loading: true, activedate: date });
  }

  handleCreatingWeek = ( evt: Object, res: Date ) => {
    this.setState({ loading: true, activedate: res });
  }

  handleOnClick = ( item: Object ): void => {
    ipcRenderer.send( '/windows/update-revenue/open', item );
  }

  handlePrevWeekClick = (): void => {
    const prevweek = moment( this.state.activedate )
      .subtract( 7, 'days' )
      .toDate();
    ipcRenderer.send( '/windows/main/check-week', prevweek );
  }

  handleNextWeekClick = (): void => {
    const nextweek = moment( this.state.activedate )
      .add( 7, 'days' )
      .toDate();
    ipcRenderer.send( '/windows/main/check-week', nextweek );
  }

  handleOverlayAction = ( key: string, item: Object ) => {
    if( key === 'edit' ) {
      this.handleOnClick( item );
    }
  }

  renderEmptyDetails = ( item: Object ) => {
    const date = moment( item.long_date );

    return (
      <Card key={item._id}>
        <div className="date info disabled">
          <p>{date.format( 'ddd' )}</p>
          <p>{date.format( 'MMM' )}</p>
          <p>{date.format( 'DD' )}</p>
        </div>
        <div
          className="profit info new disabled"
          role="presentation"
          onClick={() => this.handleOnClick( item )}
        >
          <Icon type="plus-circle" theme="outlined" />
          {'Set or Add Sales'}
        </div>
        <div className="total info disabled">
          {'$0.00'}
        </div>
      </Card>
    );
  }

  renderDetails = ( item: Object ) => {
    const date = moment( item.long_date );
    const income = item.paper_orders + item.deliveries;

    let adjTotal = 0;

    if( item.expenses.length > 0 ) {
      adjTotal = item.expenses
        .map( adj => adj.amt )
        .reduce( ( total, amt ) => total + amt );
    }

    const grandTotal = income + adjTotal;

    return (
      <Card key={item._id}>
        <div className="date info">
          <p>{date.format( 'ddd' )}</p>
          <p>{date.format( 'MMM' )}</p>
          <p>{date.format( 'DD' )}</p>
        </div>
        <div className="profit info">
          <div>
            <p>{'Income'}</p>
            <pre>{`$${income.toFixed( 2 )}`}</pre>
          </div>
          <div className="subitem">
            <div>
              <p>{'Paper Orders'}</p>
              <pre>{`$${item.paper_orders.toFixed( 2 )}`}</pre>
            </div>
            <div>
              <p>{'Deliveries'}</p>
              <pre>{`$${item.deliveries.toFixed( 2 )}`}</pre>
            </div>
          </div>
          <div>
            <p>{'Expenses'}</p>
            <pre>{`$${adjTotal.toFixed( 2 )}`}</pre>
          </div>
        </div>
        <div className="total info">
          {`$${this.toCommas( grandTotal.toFixed( 2 ) )}`}
        </div>
        <Dropdown
          overlay={<Overlay item={item} onAction={this.handleOverlayAction} />}
          trigger={[ 'click' ]}
        >
          <div className="actions">
            <Icon type="ellipsis" />
          </div>
        </Dropdown>
      </Card>
    );
  }

  renderLoadingDetails = () => {
    const emptyarray = Array.from( Array( 7 ) );

    return (
      <Fragment>
        {emptyarray.map( ( v: void, i: number ) => (
          <Card key={i}>
            <Skeleton
              active
              loading
              paragraph={{ rows: 2 }}
            />
          </Card>
        ) )}
      </Fragment>
    );
  }

  render() {
    const weekof = moment( this.state.activedate ).startOf( 'isoWeek' );

    return (
      <div id="home">
        <h1>
          {this.state.loading ? (
            <Skeleton
              active
              loading
              title={false}
              paragraph={{ rows: 2, width: [ 150, 400 ]}}
            />
          ) : (
            <Fragment>
              <small>{'Viewing week of'}</small>
              {weekof.format( 'MMMM Do, YYYY' )}
            </Fragment>
          )}
        </h1>

        <section className="overview">
          <Card title={'Income and Expenses'}>
            {this.state.loading ? (
              <Skeleton
                active
                loading
                title={false}
                paragraph={{ rows: 5 }}
              />
            ) : (
              <Line
                data={{
                  // $FlowSkip
                  labels: moment.weekdaysShort( true ),
                  datasets: [
                    {
                      label: 'Income',
                      borderColor: 'darksalmon',
                      data: this.state.revenues.map( item => (
                        item.paper_orders + item.deliveries
                      ) )
                    },
                    {
                      label: 'Expenses',
                      borderColor: 'brown',
                      data: this.state.revenues.map( item => (
                        item.expenses
                      ) )
                    }
                  ]
                }}
                options={{
                  maintainAspectRatio: false,
                  legend: {
                    display: true
                  },
                  scales: {
                    yAxes: [ {
                      ticks: {
                        beginAtZero:true
                      }
                    } ]
                  }
                }}
              />
            )}
          </Card>
          <div className="actions">
            <Card onClick={this.handlePrevWeekClick}>
              <Icon type="double-left" />
              <span>{'Prev Week'}</span>
            </Card>
            <Card onClick={this.handleNextWeekClick}>
              <Icon type="double-right" />
              <span>{'Next Week'}</span>
            </Card>
          </div>
        </section>

        <section className="details">
          {this.state.loading
            ? (
              this.renderLoadingDetails()
            ) : (
              this.state.revenues.map( ( item: Object ) => {
                if( item.paper_orders === 0 ) {
                  return this.renderEmptyDetails( item );
                }

                return this.renderDetails( item );
              })
            )}
        </section>
      </div>
    );
  }
}

export default Home;
