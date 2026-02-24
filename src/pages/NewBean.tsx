import { useNavigate } from 'react-router-dom';
import { useBeanStore } from '../stores/beanStore';
import { BeanForm } from '../components/bean';

export function NewBean() {
  const navigate = useNavigate();
  const { addBean, isLoading } = useBeanStore();

  const handleSubmit = async (values: Parameters<typeof addBean>[0]) => {
    try {
      const bean = await addBean(values);
      navigate(`/bean/${bean.id}`);
    } catch (e) {
      // Error is handled in store
    }
  };

  return (
    <div>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Add Bean</h1>
        <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
          Add a new coffee to your library
        </p>
      </header>

      <main className="px-4 pb-4">
        <BeanForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="Add Bean"
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
