'use client';

import React from 'react';
import {
  FileItem,
  FolderItem,
  FolderTrigger,
  FolderContent,
  Files,
  SubFiles,
} from '@/registry/components/radix/files';
import { FileJsonIcon } from 'lucide-react';

export const RadixFilesDemo = () => {
  return (
    <div className="relative max-w-[500px] max-h-[350px] size-full rounded-2xl border bg-background overflow-auto">
      <Files className="w-full" defaultOpen={['app']}>
        <FolderItem value="app">
          <FolderTrigger
            gitStatus="modified"
            className="w-full flex items-center justify-between"
          >
            app
          </FolderTrigger>

          <FolderContent>
            <SubFiles defaultOpen={['(home)']}>
              <FolderItem value="(home)">
                <FolderTrigger gitStatus="untracked">(home)</FolderTrigger>

                <FolderContent>
                  <FileItem gitStatus="untracked">page.tsx</FileItem>
                  <FileItem gitStatus="untracked">layout.tsx</FileItem>
                </FolderContent>
              </FolderItem>

              <FileItem>layout.tsx</FileItem>
              <FileItem gitStatus="modified">page.tsx</FileItem>
              <FileItem>global.css</FileItem>
            </SubFiles>
          </FolderContent>
        </FolderItem>

        <FolderItem value="components">
          <FolderTrigger>components</FolderTrigger>

          <FolderContent>
            <SubFiles>
              <FileItem>button.tsx</FileItem>
              <FileItem>tabs.tsx</FileItem>
              <FileItem>dialog.tsx</FileItem>

              <FolderItem value="empty">
                <FolderTrigger>empty</FolderTrigger>
              </FolderItem>
            </SubFiles>
          </FolderContent>
        </FolderItem>

        <FileItem icon={FileJsonIcon}>package.json</FileItem>
      </Files>
    </div>
  );
};
