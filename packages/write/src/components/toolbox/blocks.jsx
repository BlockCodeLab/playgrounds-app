import { Text } from '@blockcode/core';
import icons from './icons';

export const blocks = [
  {
    title: (
      <Text
        id="write.blocks.h1"
        defaultMessage="H1"
      />
    ),
    image: icons.h1,
    content: `# Heading 1`,
  },
  {
    title: (
      <Text
        id="write.blocks.h2"
        defaultMessage="H2"
      />
    ),
    image: icons.h2,
    content: `## Heading 2`,
  },
  {
    title: (
      <Text
        id="write.blocks.h3"
        defaultMessage="H3"
      />
    ),
    image: icons.h3,
    content: `### Heading 3`,
  },
  {
    title: (
      <Text
        id="write.blocks.link"
        defaultMessage="Link"
      />
    ),
    image: icons.link,
    inline: true,
    content: `[link](# "Title")`,
  },
  {
    title: (
      <Text
        id="write.blocks.image"
        defaultMessage="Image"
      />
    ),
    image: icons.image,
    inline: true,
    content: `![](${icons.image} "Title")`,
  },
  {
    title: (
      <Text
        id="write.blocks.code"
        defaultMessage="Code"
      />
    ),
    image: icons.code,
    content: '```python\nprint("Hello World!")',
  },
  {
    title: (
      <Text
        id="write.blocks.codeInline"
        defaultMessage="Code Inline"
      />
    ),
    image: icons.codeInline,
    inline: true,
    content: '`print("Hello World")`',
  },
  {
    title: (
      <Text
        id="write.blocks.list"
        defaultMessage="List"
      />
    ),
    image: icons.list,
    content: `- item\n- item\n- item`,
  },
  {
    title: (
      <Text
        id="write.blocks.order"
        defaultMessage="Order List"
      />
    ),
    image: icons.orderList,
    content: `1. item\n2. item\n3. item`,
  },
  {
    title: (
      <Text
        id="write.blocks.todo"
        defaultMessage="Todo List"
      />
    ),
    image: icons.todo,
    content: `- [x] item\n- [x] item\n- [ ] item`,
  },
  {
    title: (
      <Text
        id="write.blocks.table"
        defaultMessage="Table"
      />
    ),
    image: icons.table,
    content: `| header 1 | header 2 |\n| --- | --- |\n| cell 1 | cell 2 |\n| cell 3 | cell 4 |`,
  },
  {
    title: (
      <Text
        id="write.blocks.quote"
        defaultMessage="Quote"
      />
    ),
    image: icons.quote,
    content: `> `,
  },
  {
    title: (
      <Text
        id="write.blocks.line"
        defaultMessage="Line"
      />
    ),
    image: icons.line,
    content: `------\n`,
  },
  {
    title: (
      <Text
        id="write.blocks.scratch"
        defaultMessage="Scratch"
      />
    ),
    image: icons.scratch,
    content: '```scratch\nwhen green flag clicked\nmove (10) steps',
  },
  {
    title: (
      <Text
        id="write.blocks.math"
        defaultMessage="Math"
      />
    ),
    image: icons.math,
    content: `$$x = (-b +- sqrt(b^2-4ac))/(2a)`,
  },
  {
    title: (
      <Text
        id="write.blocks.mathInline"
        defaultMessage="Math Inline"
      />
    ),
    image: icons.mathInline,
    inline: true,
    content: `$a^2 + b^2 = c^2$`,
  },
  {
    title: (
      <Text
        id="write.blocks.chart"
        defaultMessage="Chart"
      />
    ),
    image: icons.chart,
    content:
      "```echarts\n{\n  xAxis: {\n    type: 'category',\n    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']\n  },\n  yAxis: {\n    type: 'value'\n  },\n  series: [\n    {\n      data: [820, 932, 901, 934, 1290, 1330, 1320],\n      type: 'line',\n      smooth: true\n    }\n  ]\n}",
  },
  {
    title: (
      <Text
        id="write.blocks.mindmap"
        defaultMessage="Mindmap"
      />
    ),
    image: icons.mindmap,
    content:
      '```mindmap\n  root((mindmap))\n    Origins\n      Long history\n      ::icon(fa fa-book)\n      Popularisation\n        British popular psychology author Tony Buzan\n    Research\n      On effectiveness<br/>and features\n      On Automatic creation\n        Uses\n            Creative techniques\n            Strategic planning\n            Argument mapping\n    Tools\n      Pen and paper\n      Mermaid',
  },
  {
    title: (
      <Text
        id="write.blocks.flowchart"
        defaultMessage="Flowchart"
      />
    ),
    image: icons.flowchart,
    content:
      '```mermaid\nflowchart TD\n    A[Christmas] -->|Get money| B(Go shopping)\n    B --> C{Let me think}\n    C -->|One| D[Laptop]\n    C -->|Two| E[iPhone]\n    C -->|Three| F[fa:fa-car Car]',
  },
  {
    title: (
      <Text
        id="write.blocks.sequence"
        defaultMessage="Sequence"
      />
    ),
    image: icons.sequence,
    content:
      '```mermaid\nsequenceDiagram\n    Alice->>+John: Hello John, how are you?\n    Alice->>+John: John, can you hear me?\n    John-->>-Alice: Hi Alice, I can hear you!\n    John-->>-Alice: I feel great!',
  },
  {
    title: (
      <Text
        id="write.blocks.classDiagram"
        defaultMessage="Class Diagram"
      />
    ),
    image: icons.classDiagram,
    content:
      '```mermaid\nclassDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    Animal <|-- Zebra\n    Animal: +int age\n    Animal: +String gender\n    Animal: +isMammal()\n    Animal: +mate()\n    class Duck{\n      +String beakColor\n      +swim()\n      +quack()\n    }\n    class Fish{\n      -int sizeInFeet\n      -canEat()\n    }\n    class Zebra{\n      +bool is_wild\n      +run()\n    }',
  },
  {
    title: (
      <Text
        id="write.blocks.stateMachine"
        defaultMessage="State Machine"
      />
    ),
    image: icons.stateMachine,
    content:
      '```mermaid\nstateDiagram\n    [*] --> Still\n    Still --> [*]\n    Still --> Moving\n    Moving --> Still\n    Moving --> Crash\n    Crash --> [*]',
  },
  {
    title: (
      <Text
        id="write.blocks.ganttChart"
        defaultMessage="Gantt Chart"
      />
    ),
    image: icons.ganttChart,
    content:
      '```mermaid\ngantt\ntitle A Gantt Diagram\ndateFormat  YYYY-MM-DD\nsection Section\nA task        :a1, 2019-01-01, 30d\nAnother task  :after a1, 20d\nsection Another\nTask in sec   :2019-01-12, 12d\nanother task  :24d',
  },
  {
    title: (
      <Text
        id="write.blocks.timeline"
        defaultMessage="Timeline"
      />
    ),
    image: icons.timeline,
    content:
      '```mermaid\ntimeline\n    title History of Social Media Platform\n    2002 : LinkedIn\n    2004 : Facebook\n          : Google\n    2005 : YouTube\n    2006 : Twitter',
  },
  {
    title: (
      <Text
        id="write.blocks.gitGraph"
        defaultMessage="Git Graph"
      />
    ),
    image: icons.gitGraph,
    content:
      '```mermaid\ngitGraph\n    commit\n    branch develop\n    checkout develop\n    commit\n    commit\n    checkout main\n    merge develop\n    commit\n    branch feature\n    checkout feature\n    commit\n    commit\n    checkout main\n    merge feature',
  },
  {
    title: (
      <Text
        id="write.blocks.musicalStaff"
        defaultMessage="Musical Staff"
      />
    ),
    image: icons.musicalStaff,
    content:
      '```abc\nX:1\nT:Twinkle, Twinkle, Little Star\nM:4/4\nL:1/4\nK:C\nC C G G | A A G2 | F F E E | D D C2 |\nG G F F | E E D2 | G G F F | E E D2 |\nC C G G | A A G2 | F F E E | D D C2 |]',
  },
];
