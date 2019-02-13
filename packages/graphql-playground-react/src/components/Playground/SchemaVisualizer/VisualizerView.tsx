import * as React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import GraphqlBirdseye from 'graphql-birdseye'
import {
  toggleDocs,
  changeWidthDocs,
  setDocsVisible,
} from '../../../state/docs/actions'
import Spinner from '../../Spinner'
import { columnWidth } from '../../../constants'
import { SideTabContentProps } from '../ExplorerTabs/SideTabs'
import {
  getSelectedSessionIdFromRoot,
  getIsPollingSchema,
} from '../../../state/sessions/selectors'
import { getSessionDocs } from '../../../state/docs/selectors'
import { createStructuredSelector } from 'reselect'
import { ErrorContainer } from '../DocExplorer/ErrorContainer'
import { getSettings } from '../../../state/workspace/reducers'
import { ISettings } from '../../../types'
import { SchemaExplorerContainer } from '../SchemaExplorer/SDLTypes/SDLStyles'
import { styled } from '../../../styled'

interface StateFromProps {
  docs: {
    navStack: any[]
    docsOpen: boolean
    docsWidth: number
    keyMove: boolean
  }
  isPollingSchema: boolean
  settings: ISettings
}

interface DispatchFromProps {
  toggleDocs: (sessionId: string) => any
  setDocsVisible: (sessionId: string, open: boolean) => any
  changeWidthDocs: (sessionId: string, width: number) => any
  setSchemaUpdated: () => void
}

class SDLView extends React.Component<
  SideTabContentProps & StateFromProps & DispatchFromProps
> {
  ref
  constructor(props) {
    super(props)
    ;(window as any).d = this
  }
  componentWillReceiveProps(nextProps: SideTabContentProps & StateFromProps) {
    // If user use default column size % columnWidth
    // Make the column follow the clicks
    if (!this.props.schema && nextProps.schema) {
      this.setWidth(nextProps)
    }
  }

  setWidth(props: any = this.props) {
    this.props.setWidth(props)
  }

  getWidth(props: any = this.props) {
    const rootWidth = props.docs.docsWidth || columnWidth
    return rootWidth
  }
  componentDidMount() {
    this.setWidth()
  }

  render() {
    const { schema } = this.props
    let emptySchema
    if (schema === undefined) {
      // Schema is undefined when it is being loaded via introspection.
      emptySchema = <Spinner />
    } else if (schema === null) {
      // Schema is null when it explicitly does not exist, typically due to
      // an error during introspection.
      emptySchema = <ErrorContainer>{'No Schema Available'}</ErrorContainer>
    }
    // let types
    // if (schema instanceof GraphQLSchema) {
    // 	types = sdlArray(schema)
    // }
    return (
      <SchemaExplorerContainer ref={this.setRef}>
        {emptySchema ? (
          <Container>{emptySchema}</Container>
        ) : (
          <Container>
            <GraphqlBirdseye
              schema={this.props.schema as any}
              style={{
                flex: 1,
                height: 'auto',
              }}
            />
          </Container>
        )}
      </SchemaExplorerContainer>
    )
  }
  setRef = ref => {
    this.ref = ref
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      toggleDocs,
      changeWidthDocs,
      setDocsVisible,
    },
    dispatch,
  )

const mapStateToProps = createStructuredSelector({
  settings: getSettings,
  docs: getSessionDocs,
  sessionId: getSelectedSessionIdFromRoot,
  isPollingSchema: getIsPollingSchema,
})

export default connect<StateFromProps, DispatchFromProps, SideTabContentProps>(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(SDLView)

const Container = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-flow: column;
  border-right: 1px solid ${p => p.theme.colours.black10};
  overflow: hidden;
`
