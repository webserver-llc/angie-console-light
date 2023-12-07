/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';
import styles from '../table/style.css';

export class ChartsTable extends React.Component {
  constructor(){
    super();

    this.state = {
      activeCharts: []
    };

    this.toggleChart = this.toggleChart.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState){
    return (
      this.props.data !== nextProps.data ||
      this.state.activeCharts.length !== nextState.activeCharts.length
    );
  }

  toggleChart(chartName){
    if (this.state.activeCharts.includes(chartName)) {
      this.setState({
        activeCharts: this.state.activeCharts.filter(
          name => name !== chartName
        )
      });
    } else {
      this.setState({
        activeCharts: this.state.activeCharts.concat(chartName)
      });
    }
  }

  getTitle(){
    return null;
  }

  getHeadRow(){
    return null;
  }

  getBody(){
    return null;
  }

  render(){
    const { activeCharts } = this.state;
    const { data } = this.props;
    let component = null;

    if (data) {
      component = (
        <div>
          <h1>{ this.getTitle() }</h1>

          <table className={ `${ styles.table } ${ styles.wide }` }>
            <thead>{ this.getHeadRow() }</thead>
            <tbody className={ styles['right-align'] }>
              { this.getBody() }
            </tbody>
          </table>
        </div>
      );
    }

    return component;
  }
}

export default ChartsTable;
