import type { Metadata } from "next";
import { Page } from "../about/_page";
export const metadata: Metadata = { title: "Help Centre", description: "Learn how to start a case, upload evidence, and get AI-powered decision recommendations with TraceMind.", openGraph: { title: "Help Centre — TraceMind", description: "Learn how to start a case, upload evidence, and use the AI workspace." } };
export default function Help(){return <Page title="How can we help?" eyebrow="Help centre" text="Start a case with a clear problem and outcome. Add only the evidence relevant to the decision, then use the workspace to ask focused follow-up questions." cards={['Getting started with cases','Uploading and processing evidence','Understanding AI recommendations']}/>};
