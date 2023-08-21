import React from 'react';
import { spy, stub } from 'sinon';
import { shallow } from 'enzyme';
import tooltips from '#/tooltips/index.jsx';
import ExpandableTable from '../expandabletable.jsx';
import styles from '../style.css';

describe('<ExpandableTable>', () => {
  let wrapper, instance;
  const expandableItems = ['orange', 'blue', 'yellow'];
  
  beforeEach(() => {
    stub(ExpandableTable.prototype, 'getExpandableItems').callsFake(() => expandableItems);
    stub(ExpandableTable.prototype, 'hasExpandable').callsFake((name) => expandableItems.indexOf(name) !== -1);
    wrapper = shallow(<ExpandableTable />); 
    instance = wrapper.instance();
  });

  afterEach(() => {
    ExpandableTable.prototype.getExpandableItems.restore();
    ExpandableTable.prototype.hasExpandable.restore();
    wrapper.unmount();
  });
  
  it('constructor()', () => {
    expect(wrapper.instance().state).to.be.deep.equal({
      expandingItems: []
    });
  })

  it('toogleExpandingItemState()', () => {
    instance.toogleExpandingItemState(expandableItems[0]);
    expect(wrapper.state('expandingItems'), 'add first element').to.be.deep.equal([expandableItems[0]]);
    
    instance.toogleExpandingItemState(expandableItems[1]);
    expect(wrapper.state('expandingItems'), 'add second element').to.be.deep.equal([expandableItems[0], expandableItems[1]]);
    
    instance.toogleExpandingItemState(expandableItems[2]);
    expect(wrapper.state('expandingItems'), 'add third element').to.be.deep.equal(expandableItems);
    
    instance.toogleExpandingItemState(expandableItems[1]);
    expect(wrapper.state('expandingItems'), 'remove item').to.be.deep.equal(expandableItems.filter(item => item !== expandableItems[1]));
  });

  it('handleClickExpandingAll()', () => {
    instance.handleClickExpandingAll();
    expect(wrapper.state('expandingItems'), 'all expandable items').to.be.deep.equal(expandableItems);
    
    instance.handleClickExpandingAll();
    expect(wrapper.state('expandingItems'), 'empty list').to.be.deep.equal([]);
  });

  it('isExpandingAll()', () => {
    expect(instance.isExpandingAll(), 'without expanding all elements').to.be.false; 
    
    wrapper.setState({ expandingItems: expandableItems });
    expect(instance.isExpandingAll(), 'all element is selected').to.be.true;
  });
  
  it('isExpandingItem()', () => {
    expect(instance.isExpandingItem(expandableItems[1]), 'without expanding element').to.be.false; 
    
    wrapper.setState({ expandingItems: [expandableItems[1], expandableItems[2]] });
    expect(instance.isExpandingItem(expandableItems[1]), 'element is selected').to.be.true;
    expect(instance.isExpandingItem(expandableItems[2]), 'element is selected').to.be.true;
    expect(instance.isExpandingItem(expandableItems[3]), 'element isn\'t selected').to.be.false;
  });

  it('renderExpandingItemToogleIcon()', () => {
    let toogleElement;
    
    toogleElement = shallow(instance.renderExpandingItemToogleIcon('moscow'));
    expect(toogleElement.type()).to.be.equal('td'); 
    expect(toogleElement.text()).to.be.equal(''); 
    toogleElement.unmount();
    
    wrapper.setState({ expandingItems: [expandableItems[1]] });
    toogleElement = shallow(instance.renderExpandingItemToogleIcon(expandableItems[1]));
    expect(toogleElement.prop('className')).to.be.equal(styles['expanding-item-control'])
    expect(toogleElement.children().text()).to.be.equal('▴'); 
    toogleElement.unmount();

    toogleElement = shallow(instance.renderExpandingItemToogleIcon(expandableItems[2]));
    expect(toogleElement.children().text()).to.be.equal('▾'); 
    toogleElement.unmount();
  });

  it('renderExpandingAllControl()', () => {
    let control; 
    const spyHandleClickExpandingAll = spy(instance, 'handleClickExpandingAll');
		stub(tooltips, 'useTooltip').callsFake(() => ({
			prop_from_useTooltip: true
		}));
    
    control = shallow(instance.renderExpandingAllControl());
    expect(control.children().text()).to.be.equal('▾'); 
    control.unmount();
    
    wrapper.setState({ expandingItems: expandableItems });
    control = shallow(instance.renderExpandingAllControl());
    expect(control.children().text()).to.be.equal('▴'); 
    control.simulate('click');
    expect(spyHandleClickExpandingAll.calledOnce).to.be.true;
		expect(
			tooltips.useTooltip.calledWith('Show all exsists shards', 'hint-right'),
			'useTooltip call args'
		).to.be.true;
    control = shallow(instance.renderExpandingAllControl());
    expect(control.children().text()).to.be.equal('▾'); 
    control.unmount();
		tooltips.useTooltip.restore();
    spyHandleClickExpandingAll.restore();
  });
})
