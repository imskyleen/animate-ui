import * as React from 'react';
import { FolderIcon, FolderOpenIcon, FileIcon } from 'lucide-react';

import {
  Files as FilesPrimitive,
  FilesHighlight as FilesHighlightPrimitive,
  FolderItem as FolderItemPrimitive,
  FolderHeader as FolderHeaderPrimitive,
  FolderTrigger as FolderTriggerPrimitive,
  FolderHighlight as FolderHighlightPrimitive,
  Folder as FolderPrimitive,
  FolderIcon as FolderIconPrimitive,
  FileLabel as FileLabelPrimitive,
  FolderContent as FolderContentPrimitive,
  FileHighlight as FileHighlightPrimitive,
  File as FilePrimitive,
  FileIcon as FileIconPrimitive,
  type FilesProps as FilesPrimitiveProps,
  type FolderItemProps as FolderItemPrimitiveProps,
  type FolderContentProps as FolderContentPrimitiveProps,
  type FileProps as FilePrimitiveProps,
  type FileLabelProps as FileLabelPrimitiveProps,
} from '@/registry/primitives/radix/files';
import { cn } from '@workspace/ui/lib/utils';

type GitStatus = 'untracked' | 'modified' | 'deleted';

type FilesProps = FilesPrimitiveProps;

function Files({ className, children, ...props }: FilesProps) {
  return (
    <FilesPrimitive className={cn('p-2 w-full', className)} {...props}>
      <FilesHighlightPrimitive className="bg-accent rounded-lg pointer-events-none">
        {children}
      </FilesHighlightPrimitive>
    </FilesPrimitive>
  );
}

type SubFilesProps = FilesProps;

function SubFiles(props: SubFilesProps) {
  return <FilesPrimitive {...props} />;
}

type FolderItemProps = FolderItemPrimitiveProps;

function FolderItem(props: FolderItemProps) {
  return <FolderItemPrimitive {...props} />;
}

type FolderTriggerProps = FileLabelPrimitiveProps & {
  gitStatus?: GitStatus;
};

function FolderTrigger({
  children,
  className,
  gitStatus,
  ...props
}: FolderTriggerProps) {
  return (
    <FolderHeaderPrimitive>
      <FolderTriggerPrimitive className="w-full text-start">
        <FolderHighlightPrimitive>
          <FolderPrimitive className="flex items-center justify-between gap-2 p-2 pointer-events-none">
            <div
              className={cn(
                'flex items-center gap-2',
                gitStatus === 'untracked' && 'text-green-400',
                gitStatus === 'modified' && 'text-amber-400',
                gitStatus === 'deleted' && 'text-red-400',
              )}
            >
              <FolderIconPrimitive
                closeIcon={<FolderIcon className="size-4.5" />}
                openIcon={<FolderOpenIcon className="size-4.5" />}
              />
              <FileLabelPrimitive
                className={cn('text-sm', className)}
                {...props}
              >
                {children}
              </FileLabelPrimitive>
            </div>

            {gitStatus && (
              <span
                className={cn(
                  'rounded-full size-2',
                  gitStatus === 'untracked' && 'bg-green-400',
                  gitStatus === 'modified' && 'bg-amber-400',
                  gitStatus === 'deleted' && 'bg-red-400',
                )}
              />
            )}
          </FolderPrimitive>
        </FolderHighlightPrimitive>
      </FolderTriggerPrimitive>
    </FolderHeaderPrimitive>
  );
}

type FolderContentProps = FolderContentPrimitiveProps;

function FolderContent(props: FolderContentProps) {
  return (
    <div className="relative ml-6 before:absolute before:-left-2 before:inset-y-0 before:w-px before:h-full before:bg-border">
      <FolderContentPrimitive {...props} />
    </div>
  );
}

type FileItemProps = FilePrimitiveProps & {
  icon?: React.ElementType;
  gitStatus?: GitStatus;
};

function FileItem({
  icon: Icon = FileIcon,
  className,
  children,
  gitStatus,
  ...props
}: FileItemProps) {
  return (
    <FileHighlightPrimitive>
      <FilePrimitive
        className={cn(
          'flex items-center justify-between gap-2 p-2 pointer-events-none',
          gitStatus === 'untracked' && 'text-green-400',
          gitStatus === 'modified' && 'text-amber-400',
          gitStatus === 'deleted' && 'text-red-400',
        )}
      >
        <div className="flex items-center gap-2">
          <FileIconPrimitive>
            <Icon className="size-4.5" />
          </FileIconPrimitive>
          <FileLabelPrimitive className={cn('text-sm', className)} {...props}>
            {children}
          </FileLabelPrimitive>
        </div>

        {gitStatus && (
          <span className="text-sm font-medium">
            {gitStatus === 'untracked' && 'U'}
            {gitStatus === 'modified' && 'M'}
            {gitStatus === 'deleted' && 'D'}
          </span>
        )}
      </FilePrimitive>
    </FileHighlightPrimitive>
  );
}

export {
  Files,
  FolderItem,
  FolderTrigger,
  FolderContent,
  FileItem,
  SubFiles,
  type FilesProps,
  type FolderItemProps,
  type FolderTriggerProps,
  type FolderContentProps,
  type FileItemProps,
  type SubFilesProps,
};
