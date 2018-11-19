import { Document } from 'camo';


class Adjustment extends Document {
  constructor() {
    super();

    this.description = String;
    this.amt = Number;
  }

  static collectionName() {
    return 'adjustments';
  }
}

export default Adjustment;