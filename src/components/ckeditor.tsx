'use client';

import * as React from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

interface CustomEditorProps {
  customePlaceholder?: string; // Marked as optional
  data: string;
  onChange: (data: string) => void;
}

function CustomEditor({ data, customePlaceholder, onChange }: CustomEditorProps) {
  const ckEditorConfig = {
    shouldNotGroupWhenFull: true,
    toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    placeholder: customePlaceholder || 'Type your content here...', // Use placeholder if provided, fallback otherwise
    removePlugins: ['CKEditor5Watermark'],
  };

  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onChange={(event, editor) => {
        const editorData = editor.getData();
        onChange(editorData);
      }}
      config={ckEditorConfig}
    />
  );
}

export default CustomEditor;
