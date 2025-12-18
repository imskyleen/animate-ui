import {
  ScrollTargetTabs,
  ScrollTargetTabsList,
  ScrollTargetTabsHighlight,
  ScrollTargetTab,
  ScrollTargetContent,
  ScrollTargetSection,
} from '@/registry/components/animate/scroll-target-tabs';

export function AnimateScrollTargetTabsDemo() {
  return (
    <div className="flex w-full max-w-2xl">
      <ScrollTargetTabs
        defaultValue="performance"
        scrollOffset={10}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* Tab Navigation */}
        <ScrollTargetTabsHighlight
          mode="parent"
          containerClassName="bg-sidebar inline-flex items-center rounded-lg p-1"
        >
          <ScrollTargetTabsList>
            <ScrollTargetTab value="performance">Performance</ScrollTargetTab>
            <ScrollTargetTab value="improvements">Improvements</ScrollTargetTab>
            <ScrollTargetTab value="transcript">Transcript</ScrollTargetTab>
          </ScrollTargetTabsList>
        </ScrollTargetTabsHighlight>

        {/* Scrollable Content */}
        <ScrollTargetContent className="min-h-0 flex-1 max-h-[400px]">
          <div className="space-y-8 p-4">
            <ScrollTargetSection value="performance">
              <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your application has shown excellent performance metrics over
                  the past month. Response times have improved by 15% and
                  overall user satisfaction has increased.
                </p>
                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      Average response time decreased from 250ms to 212ms,
                      representing a 15% improvement in overall application
                      responsiveness.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">User Engagement</h3>
                    <p className="text-sm text-muted-foreground">
                      Session duration increased by 23%, indicating higher user
                      engagement and satisfaction with the application
                      experience.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Error Rate</h3>
                    <p className="text-sm text-muted-foreground">
                      Error rate dropped to 0.3%, down from 0.8% last month,
                      showing improved stability and reliability.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollTargetSection>

            <ScrollTargetSection value="improvements">
              <h2 className="text-2xl font-bold mb-4">Areas for Improvement</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  While performance has been strong, there are several areas
                  where we can make additional improvements to enhance the user
                  experience.
                </p>
                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Mobile Optimization</h3>
                    <p className="text-sm text-muted-foreground">
                      Mobile page load times are 30% slower than desktop.
                      Implementing lazy loading and optimizing images could
                      improve this significantly.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Database Queries</h3>
                    <p className="text-sm text-muted-foreground">
                      Some complex queries are taking longer than expected.
                      Adding proper indexing and query optimization could reduce
                      load times by up to 40%.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Caching Strategy</h3>
                    <p className="text-sm text-muted-foreground">
                      Implementing a more aggressive caching strategy for static
                      assets could reduce server load and improve response times
                      across the board.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollTargetSection>

            <ScrollTargetSection value="transcript">
              <h2 className="text-2xl font-bold mb-4">Transcript</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Here's a detailed transcript of the performance review meeting
                  held on March 15, 2024.
                </p>
                <div className="space-y-6">
                  <div>
                    <p className="font-semibold mb-1">
                      Sarah Johnson (10:00 AM):
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      "Good morning everyone. Let's start by reviewing our
                      performance metrics from last month. As you can see from
                      the dashboard, we've made significant improvements across
                      several key areas."
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">
                      Michael Chen (10:03 AM):
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      "The 15% improvement in response time is particularly
                      impressive. This was largely due to the database
                      optimization work we completed in the first week of the
                      month."
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">
                      Emily Rodriguez (10:06 AM):
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      "I'd like to highlight the user engagement metrics. The
                      23% increase in session duration suggests that our recent
                      UX improvements are resonating well with our users."
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">David Park (10:10 AM):</p>
                    <p className="text-sm text-muted-foreground pl-4">
                      "Looking at the areas for improvement, I think we should
                      prioritize mobile optimization for next quarter. The gap
                      between mobile and desktop performance is concerning."
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">
                      Sarah Johnson (10:15 AM):
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      "Agreed. Let's create a dedicated task force for mobile
                      optimization and set some specific performance targets for
                      the next review."
                    </p>
                  </div>
                </div>
              </div>
            </ScrollTargetSection>
          </div>
        </ScrollTargetContent>
      </ScrollTargetTabs>
    </div>
  );
}
