// components/ui/editor.tsx
"use client";

import { useEffect, useRef } from 'react';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<any>(null);

  const TINY_MCE_API_KEY = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY;

  return (
    <TinyMCEEditor
      apiKey={TINY_MCE_API_KEY}
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 400,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 
          'undo redo | formatselect | ' +
          'bold italic forecolor backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
            font-size: 14px; 
            line-height: 1.5;
            margin: 1rem;
          }
        `,
        branding: false,
        language: 'fr_FR',
        language_url: '/langs/fr_FR.js',
        skin: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
        content_css: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
        contextmenu: false,
        toolbar_sticky: true,
        toolbar_mode: 'sliding',
        placeholder: "Écrivez votre message ici...",
        link_context_toolbar: true,
        paste_data_images: true,
        image_advtab: true,
        file_picker_types: 'image',
        file_picker_callback: (callback, value, meta) => {
          // Gérer l'upload d'images
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            // Créer une URL temporaire pour l'aperçu
            const blobUrl = URL.createObjectURL(file);
            callback(blobUrl, { title: file.name });

            // Ici, vous pouvez implémenter votre propre logique d'upload
            // et remplacer l'URL temporaire par l'URL réelle une fois uploadée
          };
        },
        setup: (editor) => {
          editor.on('init', () => {
            // Initialiser l'éditeur avec les paramètres de thème
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            editor.dom.addStyle(`
              .mce-content-body {
                color: ${isDark ? '#ffffff' : '#000000'};
                background-color: ${isDark ? '#1a1a1a' : '#ffffff'};
              }
            `);
          });
        },
        formats: {
          bold: { inline: 'strong' },
          italic: { inline: 'em' },
          underline: { inline: 'u' },
          strikethrough: { inline: 'strike' }
        },
        style_formats: [
          { title: 'Titre 1', format: 'h1' },
          { title: 'Titre 2', format: 'h2' },
          { title: 'Titre 3', format: 'h3' },
          { title: 'Paragraphe', format: 'p' },
        ],
        custom_colors: false,
        color_map: [
          '#000000', 'Noir',
          '#ffffff', 'Blanc',
          '#ff0000', 'Rouge',
        ],
        images_upload_handler: async (blobInfo, progress) => {
          try {
            // Ici, implémentez votre logique d'upload d'images
            // Retournez l'URL de l'image uploadée
            return '/path/to/uploaded/image.jpg';
          } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', error);
            throw error;
          }
        }
      }}
    />
  );
}
