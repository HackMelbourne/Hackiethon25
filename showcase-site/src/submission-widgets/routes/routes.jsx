import Layout from '../base/Layout';
import Menu from '../pages/Menu';
import GoalReview from "../pages/GoalReview";
import GoalCreate from "../pages/GoalCreate";
import Highlights from "../pages/Highlights";
import StarRatingPage from '../pages/StarRating';
import JournalLayout from '../base/JournalLayout';
import React from 'react';
import Success from '../pages/Success';
import History from '../pages/History'

export const createRoutes = (journalState, JournalContext, useJournal) => {
  const FullJournalLayout = () => (
    <JournalContext.Provider value={journalState}>
      <JournalLayout useJournal={useJournal} />
    </JournalContext.Provider>
  );

  return [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Menu />,
        },
        {
          path: "journal",
          element: <FullJournalLayout />,
          children: [
            {
              path: "star-rating",
              element: <StarRatingPage useJournal={useJournal} />,
            },
            {
              path: "goal-review",
              element: <GoalReview useJournal={useJournal} />,
            },
            {
              path: "goal-create",
              element: <GoalCreate useJournal={useJournal} />
            },
            {
              path: "highlights",
              element: <Highlights useJournal={useJournal} />
            },
            {
              path: "history",
              element: <History useJournal={useJournal} />
            }
          ]
        },
        {
          path: "success",
          element: <Success />
        }
      ]
    },
  ];
};
