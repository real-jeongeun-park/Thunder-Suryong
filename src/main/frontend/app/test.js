import { useData } from '@/context/DataContext';

export default function TestScreen() {
  const context = useData();
  console.log('context:', context);

  return <Text>확인 중</Text>;
}