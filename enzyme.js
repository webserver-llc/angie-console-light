import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

// Configure Enzyme for the appropriate React adapter
Enzyme.configure({ adapter: new Adapter() });

// Re-export all enzyme exports
export default Enzyme;
