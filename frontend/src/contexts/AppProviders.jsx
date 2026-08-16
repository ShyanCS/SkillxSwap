import React from 'react';
import { AuthProvider } from './AuthContext';
import { SkillsProvider } from './SkillsContext';
import { MatchProvider } from './MatchContext';
import { SessionProvider } from './SessionContext';
import { WalletProvider } from './WalletContext';
import { ReviewProvider } from './ReviewContext';
import { MessagingProvider } from './MessagingContext';
import { NotificationProvider } from './NotificationContext';
import { DashboardProvider } from './DashboardContext';
import { AdminProvider } from './AdminContext';

/**
 * Composes every context provider so App.jsx doesn't accumulate a deeply
 * nested pyramid. AuthProvider must stay outermost -- the others issue
 * authenticated requests and depend on the session it establishes.
 */
const PROVIDERS = [
  AuthProvider,
  SkillsProvider,
  MatchProvider,
  SessionProvider,
  WalletProvider,
  ReviewProvider,
  MessagingProvider,
  NotificationProvider,
  DashboardProvider,
  AdminProvider,
];

const AppProviders = ({ children }) =>
  PROVIDERS.reduceRight((tree, Provider) => <Provider>{tree}</Provider>, children);

export default AppProviders;
