"use client";

import React from "react";
import { ApolloProvider } from "@apollo/client";
import createApolloClient from "@/lib/apollo-client";

const client = createApolloClient();

import { AuthGuard } from "@/components/auth-guard";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            <AuthGuard>
                {children}
            </AuthGuard>
        </ApolloProvider>
    );
}
