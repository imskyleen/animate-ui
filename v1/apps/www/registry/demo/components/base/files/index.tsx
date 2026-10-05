'use client';

import React from 'react';
import {
  FileItem,
  FolderItem,
  FolderTrigger,
  FolderPanel,
  Files,
  SubFiles,
} from '@/registry/components/base/files';
import { FileJsonIcon } from 'lucide-react';

export const BaseFilesDemo = () => {
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

          <FolderPanel>
            <SubFiles defaultOpen={['(home)']}>
              <FolderItem value="(home)">
                <FolderTrigger gitStatus="untracked">(home)</FolderTrigger>

                <FolderPanel>
                  <FileItem gitStatus="untracked">page.tsx</FileItem>
                  <FileItem gitStatus="untracked">layout.tsx</FileItem>
                </FolderPanel>
              </FolderItem>

              <FileItem>layout.tsx</FileItem>
              <FileItem gitStatus="modified">page.tsx</FileItem>
              <FileItem>global.css</FileItem>
            </SubFiles>
          </FolderPanel>
        </FolderItem>

        <FolderItem value="components">
          <FolderTrigger>components</FolderTrigger>

          <FolderPanel>
            <SubFiles>
              <FileItem>button.tsx</FileItem>
              <FileItem>tabs.tsx</FileItem>
              <FileItem>dialog.tsx</FileItem>

              <FolderItem value="empty">
                <FolderTrigger>empty</FolderTrigger>
              </FolderItem>
            </SubFiles>
          </FolderPanel>
        </FolderItem>

        <FileItem icon={FileJsonIcon}>package.json</FileItem>
      </Files>
    </div>
  );
};
