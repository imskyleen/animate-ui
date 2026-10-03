import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@workspace/ui/components/ui/breadcrumb';
import { cn } from '@workspace/ui/lib/utils';

export const DocsBreadcrumb = ({ slug }: { slug?: string[] }) => {
  return (
    <Breadcrumb className="mb-2 max-xl:hidden">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>

        {slug &&
          slug.length > 0 &&
          slug.map((item, index) => (
            <React.Fragment key={item}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className={cn(
                    'capitalize',
                    index === slug.length - 1 && 'text-foreground',
                  )}
                  href={
                    index === slug.length - 1
                      ? `/docs/${slug.join('/')}`
                      : index === 0
                        ? `/docs/${item}`
                        : `#`
                  }
                >
                  {item.replace(/-/g, ' ')}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
