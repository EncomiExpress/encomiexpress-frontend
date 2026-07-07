import { useTheme } from '@mui/material/styles'
import { GlobalStyles, Tooltip } from '@mui/material'

const getToggleCss = (primaryColor) => `
  .ee-toggle {
    --sz: 10px; --sz1: calc(var(--sz) / 10);
    --on: ${primaryColor}; --no: #9ca3af; --bg: #212121;
    --tr: all 0.5s ease 0s;
    position: relative;
    width: calc(var(--sz) * 4);
    height: calc(var(--sz) * 2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: center;
  }
  .ee-toggle .ee-input { display: none; }
  .ee-toggle label {
    position: absolute;
    width: calc(var(--sz) * 4);
    height: calc(var(--sz) * 2);
    background: var(--no);
    border-radius: var(--sz);
    pointer-events: none;
    transition: var(--tr);
  }
  .ee-toggle .ee-input:checked + label { background: var(--on); }
  .ee-toggle label:before, .ee-toggle label:after {
    content: "";
    position: absolute;
    border-right: calc(var(--sz1) * 2) solid var(--bg);
    height: calc(var(--sz1) * 12);
    left: calc(var(--sz1) * 28);
    top: calc(var(--sz1) * 4);
    transform: rotate(45deg);
    transition: var(--tr);
  }
  .ee-toggle label:after { transform: rotate(-45deg); }
  .ee-toggle .ee-input:checked + label:before,
  .ee-toggle .ee-input:checked + label:after {
    --bg: #fff;
    border-right: calc(var(--sz1) * 2) solid var(--bg);
    height: calc(var(--sz1) * 9);
    left: calc(var(--sz1) * 11.5);
    top: calc(var(--sz1) * 5.5);
    transform: rotate(35deg);
  }
  .ee-toggle .ee-input:checked + label:after {
    transform: rotate(-56deg);
    height: calc(var(--sz1) * 6);
    left: calc(var(--sz1) * 7.7);
    top: calc(var(--sz1) * 9);
  }
  .ee-toggle label .ee-thumb:hover { background: #fff; }
  .ee-toggle .ee-input:checked + label .ee-thumb:hover { background: #282828; }
  .ee-toggle .ee-input:checked + label .ee-thumb:hover:before,
  .ee-toggle .ee-input:checked + label .ee-thumb:hover:after { animation-play-state: paused; }
  .ee-toggle .ee-thumb {
    position: absolute;
    width: calc(calc(var(--sz) * 2) - calc(var(--sz) / 3));
    height: calc(calc(var(--sz) * 2) - calc(var(--sz) / 3));
    top: calc(calc(var(--sz) / 10) + calc(var(--sz) / 15));
    left: calc(calc(var(--sz) / 10) + calc(var(--sz) / 15));
    background: var(--bg);
    border-radius: var(--sz);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    overflow: hidden;
    --cl: var(--no);
    pointer-events: all;
    transition: var(--tr);
  }
  .ee-toggle .ee-input:checked + label .ee-thumb {
    left: calc(calc(100% - calc(calc(var(--sz) * 2) - calc(var(--sz) / 3))) - calc(calc(var(--sz) / 10) + calc(var(--sz) / 15)));
    --bg: #fff;
  }
`

const ToggleSwitch = ({ id, checked, onChange }) => {
    const theme = useTheme()
    return (
        <>
            <GlobalStyles styles={getToggleCss(theme.palette.primary.main)} />
            <Tooltip title={checked ? 'Inhabilitar' : 'Habilitar'}>
                <div className="ee-toggle">
                    <input
                        type="checkbox"
                        id={`ee-btn-${id}`}
                        className="ee-input"
                        checked={checked}
                        onChange={onChange}
                    />
                    <label htmlFor={`ee-btn-${id}`}>
                        <span className="ee-thumb"></span>
                    </label>
                </div>
            </Tooltip>
        </>
    )
}

export default ToggleSwitch
