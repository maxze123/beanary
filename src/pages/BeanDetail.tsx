import { useParams } from 'react-router-dom';

export function BeanDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="px-5 pt-12 pb-4">
      <h1 className="text-2xl font-semibold">Bean Detail</h1>
      <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">Bean ID: {id}</p>
    </div>
  );
}
