import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">About</h1>
      </div>

      <div className="space-y-8">
        {/* Developer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Developer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-medium">Niklas Kronig</p>
            <p className="text-muted-foreground">
              Lifelong passion for technology and IT.
              Currently working in the IT field, combining professional experience with a drive for creative side projects.
            </p>
            <p className="text-muted-foreground">
              Passionate gamer and active in the Rainbow Six Siege esports scene.
              TactiHub is a heart project — built to help his team and other esports teams plan and coordinate strategies more effectively.
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About TactiHub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              TactiHub is a modern, collaborative strategy planning tool for Rainbow Six Siege.
              It allows teams to draw tactics on game maps, share battle plans, and coordinate
              strategies in real-time.
            </p>
            <p className="text-muted-foreground">
              This project is built upon the ideas and work of two original open-source projects
              that are unfortunately no longer actively maintained. TactiHub merges their best
              features into a single, modern application with a new tech stack and additional functionality.
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Original Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Based On</h2>
          <p className="text-muted-foreground mb-6">
            TactiHub would not exist without these two projects. While both have been inactive for
            several years, they laid the groundwork for what TactiHub is today.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  r6-map-planner
                  <a
                    href="https://github.com/prayansh/r6-map-planner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">prayansh</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  A real-time collaborative map planning tool built with Node.js, Express and
                  Socket.IO. It provided the foundation for the real-time collaboration features,
                  live cursor tracking, and the multi-game canvas drawing system.
                </p>
                <a
                  href="https://github.com/prayansh/r6-map-planner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  github.com/prayansh/r6-map-planner
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  r6-maps
                  <a
                    href="https://github.com/jayfoe/r6-maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">jayfoe</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  A battle plan management system built with Laravel and Vue.js. It provided
                  the blueprint for user authentication, database persistence, battle plan
                  management, voting system, and the admin panel.
                </p>
                <a
                  href="https://github.com/jayfoe/r6-maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  github.com/jayfoe/r6-maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Changelog link */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              For a full list of changes and past releases, see the{' '}
              <Link to="/changelog" className="text-primary hover:underline font-medium">Changelog</Link>.
            </p>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              TactiHub is built as a modern TypeScript monorepo using:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>React + Vite (Frontend)</li>
              <li>Fastify (Backend API)</li>
              <li>Socket.IO (Real-time Communication)</li>
              <li>PostgreSQL + Drizzle ORM (Database)</li>
              <li>Redis (Caching & Session Management)</li>
              <li>Tailwind CSS + shadcn/ui (UI)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Source Code */}
        <Card>
          <CardHeader>
            <CardTitle>Source Code</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="https://github.com/niklask52t/TactiHub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              github.com/niklask52t/TactiHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              TactiHub is a fan-made tool and is not affiliated with, endorsed by, or connected
              to Ubisoft or any other game publisher. All game names, logos, and
              related assets are trademarks of their respective owners.
            </p>
            <p>
              Some images used on this website are screenshots from the game Tom Clancy&apos;s Rainbow Six Siege,
              developed and published by Ubisoft.
              Map images and operator icons used in this application are property of their
              respective game publishers and are used for informational and educational purposes only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
