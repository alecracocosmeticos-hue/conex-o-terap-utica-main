import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

const Logs = () => (
  <div>
    <PageHeader title="Logs" description="Logs do sistema" />
    <Card><CardContent className="py-12 text-center text-muted-foreground">Placeholder para visualização de logs.</CardContent></Card>
  </div>
);
export default Logs;
