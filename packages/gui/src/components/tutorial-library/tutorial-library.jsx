import { useComputed } from '@preact/signals';
import { useAppContext, Text, Library } from '@blockcode/core';

export function TutorialLibrary({ onOpenTutorial, onClose }) {
  const { tutorials } = useAppContext();

  const data = useComputed(() => {
    const result = Object.entries(tutorials.value.lessons);
    return result.map(([id, lesson]) => ({
      featured: true,
      title: lesson.title,
      image: lesson.image,
      onSelect: () => onOpenTutorial(id),
    }));
  });

  const defaultTitle =
    tutorials.type === 'course' ? (
      <Text
        id="gui.library.tutorials.course"
        defaultMessage="Choose a course"
      />
    ) : (
      <Text
        id="gui.library.tutorials.tutorial"
        defaultMessage="Choose a tutorial"
      />
    );

  return (
    <Library
      items={data}
      title={tutorials.title || defaultTitle}
      onClose={onClose}
    />
  );
}
