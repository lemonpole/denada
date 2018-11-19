import { Document } from 'camo';
import Adjustment from './adjustment';


class Revenue extends Document {
  constructor() {
    super();

    this.week = Number;
    this.month = Number;
    this.year = Number;
    this.long_date = String;
    this.paper_orders = {
      type: Number,
      default: 0
    };
    this.deliveries = {
      type: Number,
      default: 0
    };
    this.credit = {
      type: Number,
      default: 0
    };
    this.adjustments = [ Adjustment ];
  }

  static collectionName() {
    return 'revenues';
  }
}

export default Revenue;