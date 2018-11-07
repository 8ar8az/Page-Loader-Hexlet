import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';

export default axios.create({ adapter: httpAdapter });
