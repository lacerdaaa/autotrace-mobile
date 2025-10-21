import { PropsWithChildren } from 'react';

import { AuthProvider } from '@/contexts/auth-context';
import { QueryProvider } from './query-provider';

export const AppProvider = ({ children }: PropsWithChildren) => (
  <QueryProvider>
    <AuthProvider>{children}</AuthProvider>
  </QueryProvider>
);
