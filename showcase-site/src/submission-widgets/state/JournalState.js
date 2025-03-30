export const createJournalState = () => {
  let state = {
    rating: null,
    goalReview: null,
    currGoal: "",
    highlight: "",
  };

  return {
    get rating() {
      return state.rating;
    },
    setRating(value) {
      state.rating = value;
    },

    get goalReview() {
      return state.goalReview;
    },
    setGoalReview(value) {
      state.goalReview = value;
    },

    get goal() {
      return state.currGoal;
    },
    setGoal(value) {
      state.currGoal = value;
    },

    get highlight() {
      return state.highlight;
    },
    setHighlight(value) {
      state.highlight = value;
    },

    reset() {
      state.rating = null;
      state.goalReview = null;
      state.currGoal = "";
      state.highlight = "";
    },
  };
};
