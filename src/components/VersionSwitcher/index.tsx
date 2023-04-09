import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { useVersion } from '../../contexts/Application'
import { BasicLink } from '../Link'

const VersionSwitcherToggler = styled.div`
  display: flex;
  align-items: center;
  padding: 3px;
  border: 1px solid #434564;
  border-radius: 8px;
`

const VersionSwitcherTogglerItem = styled(BasicLink)<{ isActive }>`
  text-transform: capitalize;
  color: white;
  width: 100%;
  padding: 6px;
  border-radius: 8px;
  background-color: ${({ isActive }) => (isActive ? '#42d784' : 'transparent')};
  opacity: ${({ isActive }) => (isActive ? '1' : '0.6')};
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  :hover {
    opacity: 1;
  }
`

function VersionSwitcher() {
  const { isV3 } = useVersion()

  const versions = ['v2', 'v3']

  return (
    <VersionSwitcherToggler>
      {versions.map((version, i) => (
        <VersionSwitcherTogglerItem
          key={i}
          to={`/home/${version}`}
          isActive={version === 'v3' ? isV3 : !isV3}
          onClick={() => setTimeout(() => window.location.reload(), 500)}
        >
          {version}
        </VersionSwitcherTogglerItem>
      ))}
    </VersionSwitcherToggler>
  )
}

export default withRouter(VersionSwitcher)
