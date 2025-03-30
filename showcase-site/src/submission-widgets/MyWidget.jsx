import React from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { createJournalState } from './state/JournalState';
import { createJournalContext } from './context/CreateJournalContext';
import { createRoutes } from './routes/routes';

const MyWidget = () => {
  const journalState = createJournalState();
  const { JournalContext, useJournal } = createJournalContext(); 

  const routes = createRoutes(journalState, JournalContext, useJournal);

  const router = createMemoryRouter(routes, { initialEntries: ['/'] });

  return <div><RouterProvider router={router} /></div>;
};

export default MyWidget;
