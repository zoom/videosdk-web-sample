/**
 * A simple class to contain, read, and modify our app's state
 * 
 * If familiar with redux, it is the recommend approach for state management
 */
class SimpleState {
  constructor() {
    this.reset();
  }

  /**
   * Resets state to default values
   */
  reset() {
    this.selfId = -1;
    this.participants = [];
  }

  resetParticipantId() {
    this.participants = [];
  }
}

// Provide global state
export default new SimpleState();
