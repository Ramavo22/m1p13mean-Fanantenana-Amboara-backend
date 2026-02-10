class BoxUtils {

  static validStates = ['AVAILABLE', 'RENTED', 'REPAIR'];

  static validateState(value) {
    return BoxUtils.validStates.includes(value);
  }

  static validateStateChange(oldValue, newValue) {
    // états inconnus
    if (
      !BoxUtils.validateState(oldValue) ||
      !BoxUtils.validateState(newValue)
    ) {
      return false;
    }

    // règle métier : REPAIR => RENTED interdit
    if (oldValue === 'REPAIR' && newValue === 'RENTED') {
      return false;
    }

    return true;
  }
}

module.exports = BoxUtils;