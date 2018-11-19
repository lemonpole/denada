// @flow
import React, { Component, Fragment } from 'react';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import { Card, Icon, Skeleton } from 'antd';
import { Bar, Pie } from 'react-chartjs-2';

import './home.scss';


type State = {
  activedate: Date,
  loading: boolean,
  revenues: Array<any>
};

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

  totalize = (): Object => {
    let income = 0;
    let expenses = 0; // @TODO
    let cash = 0;
    let credit = 0;

    this.state.revenues.forEach( ( item: Object ) => {
      income += item.paper_orders + item.deliveries + item.credit;
      expenses += 0;
      cash += item.paper_orders + item.deliveries;
      credit += item.credit;
    });

    return {
      income, expenses, cash, credit
    };
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
    const cashTotal = item.paper_orders + item.deliveries;

    let adjTotal = 0;

    if( item.adjustments.length > 0 ) {
      adjTotal = item.adjustments
        .map( adj => adj.amt )
        .reduce( ( total, amt ) => total + amt );
    }

    const grandTotal = cashTotal + item.credit + adjTotal;

    return (
      <Card key={item._id}>
        <div className="date info">
          <p>{date.format( 'ddd' )}</p>
          <p>{date.format( 'MMM' )}</p>
          <p>{date.format( 'DD' )}</p>
        </div>
        <div className="profit info">
          <div>
            <p>{'Cash'}</p>
            <pre>{`$${cashTotal.toFixed( 2 )}`}</pre>
          </div>
          <div>
            <p>{'Credit'}</p>
            <pre>{`$${item.credit.toFixed( 2 )}`}</pre>
          </div>
          <div>
            <p>{'Expenses/Adjustments'}</p>
            <pre>{`$${adjTotal.toFixed( 2 )}`}</pre>
          </div>
        </div>
        <div className="total info">
          {`$${this.toCommas( grandTotal.toFixed( 2 ) )}`}
        </div>
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
    // totalize income and expenses
    // totalize paper orders and deliveries -vs- credit
    const {
      income, expenses,
      cash, credit
    } = this.totalize();

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
              <Bar
                data={{
                  labels: [ 'Income', 'Expenses' ],
                  datasets: [ {
                    data: [ income, expenses ],
                    backgroundColor: [
                      'darksalmon',
                      'brown'
                    ]
                  } ]
                }}
                options={{
                  maintainAspectRatio: false,
                  legend: {
                    display: false
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
          <Card title={'Cash and Credit'}>
            {this.state.loading ? (
              <Skeleton
                active
                loading
                title={false}
                paragraph={{ rows: 5 }}
              />
            ) : (
              <Pie
                data={{
                  labels: [ 'Cash', 'Credit' ],
                  datasets: [ {
                    data: [ cash, credit ],
                    backgroundColor: [
                      'darkseagreen',
                      'darkcyan'
                    ]
                  } ]
                }}
                options={{
                  maintainAspectRatio: false
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