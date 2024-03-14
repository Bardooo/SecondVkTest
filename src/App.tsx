import './App.scss';
import { useEffect, useRef, useState } from 'react';
import {
  AppRoot,
  SplitLayout,
  SplitCol,
  View,
  Panel,
  PanelHeader,
  Header,
  Group,
  SimpleCell,
  usePlatform,
  Button,
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import axios from 'axios';

type GetFactResponse = {
  fact: string;
  length: number;
};

const App = () => {
  const platform = usePlatform();
  const [fInputVal, setFInputVal] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<string | null>(null);
  const inputRef = useRef(null);
  const prevNameRef = useRef('');
  const cancelTokenSourceRef = useRef(null);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.currentTarget.value.replace(/[^a-zA-Z ]/g, '');
    setName(event.target.value);
  };

  const fetchAge = async (inputName: string) => {
    if (inputName.trim() === prevNameRef.current.trim()) {
      console.log("Дублирующий запрос, пропускаем...");
      return;
    }

    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel("Отмена из-за нового запроса");
    }

    cancelTokenSourceRef.current = axios.CancelToken.source();
    
    try {
      const response = await axios.get(`https://api.agify.io/?name=${inputName}`, { cancelToken: cancelTokenSourceRef.current.token });
      setAge(`Возраст: ${response.data.age}`);
      prevNameRef.current = inputName;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Ошибка при выполнении запроса:", error);
        setAge('Ошибка при загрузке данных');
      }
    }
  };

  useEffect(() => {
    if (name) {
      const handler = setTimeout(() => fetchAge(name), 3000);
      return () => clearTimeout(handler);
    }
  }, [name]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchAge(name);
  };

  async function getFact() {
    try {
      const { data } = await axios.get<GetFactResponse>('https://catfact.ninja/fact');
      setFInputVal(data.fact);
    } catch (err) {
      alert('Ошибка при запросе данных');
      console.log(err);
    }
  }

  useEffect(() => {
    if (fInputVal && inputRef.current) {
      const firstWordLength = fInputVal.indexOf(' ') + 1;
      const cursorPosition = firstWordLength || fInputVal.length;
      const inputElement = inputRef.current;

      inputElement.focus();
      inputElement.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [fInputVal]);
  
  return (
    <AppRoot>
      <SplitLayout header={platform !== 'vkcom' && <PanelHeader delimiter="none" />}>
        <SplitCol autoSpaced>
          <View activePanel="main">
            <Panel id="main">
              <PanelHeader>Профильное задание от ВК</PanelHeader>
              <Group header={<Header mode="secondary">First task</Header>}>
                <SimpleCell>
                  <input
                    className="ftask-input"
                    ref={inputRef}
                    value={fInputVal}
                    onChange={(el) => setFInputVal(el.target.value)}
                    type="text"
                  />
                </SimpleCell>
                <SimpleCell>
                  <Button onClick={getFact}>Факт</Button>
                </SimpleCell>
              </Group>
              <Group header={<Header mode="secondary">Second task</Header>}>
                <form onSubmit={handleSubmit}>
                  <SimpleCell className="inp">
                    <input
                      className="ftask-input"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Введите имя"
                      type="text"
                    />
                  </SimpleCell>
                  {age !== null && <SimpleCell><p>{age}</p></SimpleCell>}
                  <SimpleCell>
                    <Button
                      type='submit'
                      >
                      Получить возраст
                    </Button>
                  </SimpleCell>
                </form>
              </Group>
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  );
};

export default App;
